# 全能型加解密与验签工具 - 项目需求与技术架构说明书

## 1. 项目概述

本项目旨在开发一款纯软件算法实现的本地加解密与签名验证工具。工具需同时支持文本、16 进制字符串、Base64 以及裸二进制流（文件）的处理。

系统的核心设计哲学是**"前后端彻底解耦"**。核心密码学逻辑必须封装为独立、纯净的 C++ 库，不仅为本工具的 GUI 提供服务，更作为开发者的"算法代码仓库"，随时支持一键提取源码并零成本移植到其他 C++ 独立工程或底层嵌入式环境中。

## 2. 核心架构与技术栈要求

开发者在实现时必须严格遵守以下技术规范：

| 类别 | 要求 |
|------|------|
| **编程语言** | C++17 或 C++20 |
| **构建系统** | CMake（跨平台支持，结构清晰，核心算法库与 GUI 执行文件分离） |
| **底层密码库** | Crypto++ 或 OpenSSL (libcrypto)。禁止手写核心密码学算法以防范侧信道攻击 |
| **GUI 框架** | Qt 或 Dear ImGui（由开发者评估接入成本决定，但严禁将 GUI 逻辑与密码学逻辑混编） |

### 架构分层设计

```
┌─────────────────────────────────────────────────────────────┐
│                        GUI 层                               │
│                 (Qt / Dear ImGui)                           │
├─────────────────────────────────────────────────────────────┤
│                      Facade 层                             │
│                   CryptoManager                            │
├────────────────────┬────────────────────┬──────────────────┤
│   适配器层         │   策略层            │   工具层          │
│   DataAdapter      │   ISymmetricCipher  │   DataConverter  │
│                    │   ISigner          │   SecureBuffer   │
│                    │   IHash            │                  │
├────────────────────┴────────────────────┴──────────────────┤
│                   核心算法库 (Core Lib)                      │
│              (Crypto++ / OpenSSL 封装)                      │
└─────────────────────────────────────────────────────────────┘
```

## 3. 核心数据流转规范 (高优先级)

为了保证处理底层网络报文和 16 进制数据的精确性，**严禁在核心计算层使用 std::string 进行数据流转**。

### 3.1 统一数据载体

- 核心接口必须统一使用 `std::vector<uint8_t>` 或 `std::span<const uint8_t>` 传递数据
- 禁止在核心算法层暴露 `std::string` 或 `char*`

### 3.2 内存安全容器 (SecureBuffer)

针对私钥 (Private Key)、明文密钥 (Symmetric Key) 和初始化向量 (IV)，必须实现或使用带有安全分配器的容器。要求在对象析构时强制调用 `SecureZeroMemory`（或等效函数）清空内存，防止内存转储泄漏。

```cpp
// 设计参考
class SecureBuffer {
public:
    explicit SecureBuffer(size_t size);
    ~SecureBuffer();
    
    uint8_t* data();
    const uint8_t* data() const;
    size_t size() const;
    
    // 禁止拷贝
    SecureBuffer(const SecureBuffer&) = delete;
    SecureBuffer& operator=(const SecureBuffer&) = delete;
    
private:
    void secure_zero();
};
```

### 3.3 格式转换器 (DataConverter)

必须实现一个纯静态工具类，提供极高效率的转换接口：

| 方法 | 功能描述 |
|------|----------|
| `HexToBytes` | 十六进制字符串 → 二进制流 |
| `BytesToHex` | 二进制流 → 十六进制字符串（大写/小写可选） |
| `Base64ToBytes` | Base64 字符串 → 二进制流 |
| `BytesToBase64` | 二进制流 → Base64 字符串 |
| `StringToBytes` | UTF-8 字符串 → 二进制流 |
| `BytesToString` | 二进制流 → UTF-8 字符串 |
| `FileToBytes` | 文件 → 二进制流（支持大文件分块读取） |
| `BytesToFile` | 二进制流 → 文件（支持大文件分块写入） |

## 4. 功能需求细则

### 4.1 对称加解密模块

#### 核心算法：AES

| 模式 | 要求 | 备注 |
|------|------|------|
| **AES-GCM (256-bit)** | ✅ 必须支持 | 提供 AAD（附加认证数据）和 Tag 输出接口 |
| **AES-CBC** | ✅ 必须支持 | 提供填充模式选择（PKCS7 / ZeroPadding） |

#### 辅助功能

- 提供一键生成安全随机 IV (Initialization Vector) 的功能
- IV 长度根据模式自动生成（GCM 默认 12 字节）

### 4.2 非对称加解密与签名模块

#### 核心算法

- **RSA** (推荐 2048/4096 位)
- **ECDSA** 或 **Ed25519**

#### 密钥管理

- 支持导入/导出标准 `.pem` 和 `.der` 格式的公私钥对
- PEM 格式需支持 PKCS#8 (私钥) 和 X.509 (公钥)

#### 功能接口

| 功能 | 接口要求 |
|------|----------|
| RSA 公钥加密 | 需支持 OAEP 填充 |
| RSA 私钥解密 | 配合 OAEP 解填充 |
| 私钥生成数字签名 | 支持 PKCS#1 v1.5 和 PSS |
| 公钥验证数字签名 | 返回验签结果 + 错误码 |
| ECDSA/Ed25519 签名 | 遵循 RFC 8032 |

### 4.3 哈希与消息认证码 (MAC)

| 类型 | 算法 | 要求 |
|------|------|------|
| **哈希** | SHA-256 | ✅ 必须 |
| **哈希** | SHA-512 | ✅ 必须 |
| **MAC** | HMAC-SHA256 | ✅ 必须 |

### 4.4 核心软算法源码展示与一键提取 (Source Code Vault)

#### 设计初衷

本工具需兼作开发者的"算法代码军火库"。

#### 源码查阅面板 (Code View Tab)

在主界面或侧边栏提供"源码视图"。当用户在功能区选择某一算法（例如 AES-256-GCM）时，该面板需实时展示当前实际调用的底层 C++ 实现源码，并支持基础代码语法高亮。

#### 一键提取功能

- **"复制到剪贴板"** 按钮
- **"导出为 .h / .cpp 文件"** 按钮

#### 高内聚实现规范（强制要求）

开发者提供的软算法实现**绝对禁止**耦合任何 GUI 库宏（如 `QString`）或特定项目上下文。展示的源码必须是**"自包含 (Self-contained)"**的，确保用户提取代码后，只需在目标工程中链接对应的密码学底层库即可直接编译通过。

### 4.5 典型使用场景示例

```cpp
// 示例：使用 AES-256-GCM 加密
std::vector<uint8_t> plaintext = DataConverter::hexToBytes("48656c6c6f20576f726c64");
std::vector<uint8_t> key = DataConverter::hexToBytes("0123456789abcdef...");
std::vector<uint8_t> iv = CryptoManager::generateSecureIV(12);

auto result = cryptoManager.encryptAesGcm(plaintext, key, iv);
if (result.isOk()) {
    auto ciphertext = result.value().ciphertext;
    auto tag = result.value().tag;
    // ...
}
```

## 5. 图形化界面 (GUI) 交互需求

界面设计需满足工程师高频调试的需求，注重直观与效率。

### 5.1 双栏对比视图

采用经典的"**左侧输入区 / 右侧输出区**"布局。

### 5.2 实时格式拨动

在每个文本区上方，必须提供 **[文本] | [HEX] | [Base64]** 的拨动开关。

- 用户切换开关时，**底层原始二进制数据不变**
- 仅界面显示格式发生实时转换

### 5.3 大文件拖拽支持

- 界面需支持直接将系统文件拖拽至输入区
- 触发文件流运算
- 完成后弹出保存路径选择对话框

### 5.4 防卡死设计

对于大文件处理，必须采用：

- **分块读取 (Chunking)** - 按 64KB 或 1MB 分块处理
- **异步线程机制** - 不阻塞主 UI 线程
- **进度条展示** - 实时显示处理进度

## 6. 异常与错误处理

### 6.1 底层错误返回机制

- 遇到错误的填充、长度不合规的 16 进制字符串、或无效密钥时
- 底层应返回错误码（如 `std::expected` 或自定义 `Result` 对象）
- **严禁直接抛出未捕获的异常导致程序闪退**

### 6.2 友好提示

GUI 层需捕获上述错误，并以红色警告文本精准提示用户：

| 错误场景 | 提示示例 |
|----------|----------|
| IV 长度不合规 | "IV 长度必须为 12 字节 (GCM 模式)" |
| 验签失败 | "验签失败：公钥与签名不匹配" |
| 密钥长度错误 | "AES-256 密钥长度必须为 32 字节" |
| Base64 格式错误 | "无效的 Base64 字符串：长度不是 4 的倍数" |

## 7. 项目结构建议

```
crypto-tool/
├── CMakeLists.txt
├── cmake/
│   ├── Toolchain.cmake (可选)
│   └── Dependencies.cmake
├── include/
│   ├── crypto/
│   │   ├── ISymmetricCipher.h
│   │   ├── ISigner.h
│   │   ├── IHash.h
│   │   ├── CryptoManager.h
│   │   ├── DataConverter.h
│   │   └── SecureBuffer.h
│   └── impl/
│       ├── AesCipher.h / .cpp
│       ├── RsaCipher.h / .cpp
│       ├── EcdsaSigner.h / .cpp
│       └── HmacHash.h / .cpp
├── src/
│   ├── crypto/ (核心算法实现)
│   └── gui/ (GUI 实现)
├── tests/
│   ├── unit_tests/
│   └── integration_tests/
├── apps/
│   └── gui/ (Qt 或 ImGui 可执行程序)
└── README.md
```

## 8. 依赖与构建

### 最小依赖

| 依赖 | 用途 | 许可 |
|------|------|------|
| CMake ≥ 3.16 | 构建系统 | BSD-3-Clause |
| Crypto++ ≥ 5.6.5 **或** OpenSSL ≥ 1.1.1 | 密码学算法库 | Crypto++ (Boost-like) / OpenSSL (Apache-2.0) |
| Qt 6.x **或** Dear ImGui | GUI 框架 | GPL/LGPL 或 MIT |

### 可选依赖

| 依赖 | 用途 | 许可 |
|------|------|------|
| Google Test | 单元测试 | BSD-3-Clause |
| spdlog | 日志记录 | MIT |

---

## 附录 A：关键接口定义示例

### A.1 对称加密接口

```cpp
class ISymmetricCipher {
public:
    virtual ~ISymmetricCipher() = default;
    
    struct EncryptResult {
        std::vector<uint8_t> ciphertext;
        std::vector<uint8_t> tag;        // GCM Tag
        std::vector<uint8_t> iv;
    };
    
    struct DecryptResult {
        std::vector<uint8_t> plaintext;
        bool tag_valid;
    };
    
    virtual std::expected<EncryptResult, ErrorCode> 
    encrypt(const std::vector<uint8_t>& plaintext,
            const std::vector<uint8_t>& key,
            const std::vector<uint8_t>& iv,
            const std::vector<uint8_t>* aad = nullptr) = 0;
    
    virtual std::expected<DecryptResult, ErrorCode> 
    decrypt(const std::vector<uint8_t>& ciphertext,
            const std::vector<uint8_t>& tag,
            const std::vector<uint8_t>& key,
            const std::vector<uint8_t>& iv,
            const std::vector<uint8_t>* aad = nullptr) = 0;
    
    virtual std::vector<uint8_t> generateIV(size_t length) = 0;
};
```

### A.2 签名接口

```cpp
class ISigner {
public:
    virtual ~ISigner() = default;
    
    virtual std::expected<std::vector<uint8_t>, ErrorCode> 
    sign(const std::vector<uint8_t>& data,
         const std::vector<uint8_t>& privateKey) = 0;
    
    virtual bool 
    verify(const std::vector<uint8_t>& data,
           const std::vector<uint8_t>& signature,
           const std::vector<uint8_t>& publicKey) = 0;
    
    virtual std::pair<std::vector<uint8_t>, std::vector<uint8_t>> 
    generateKeyPair() = 0;  // 返回 {privateKey, publicKey}
};
```

---

**文档版本**: v1.0
**创建日期**: 2026-02-14
**状态**: 待开发
