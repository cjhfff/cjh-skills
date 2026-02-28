# 📚 知识汇总表

> 实时更新 - 每次探索后记录

| 2026-02-27 | everything-claude-code | Claude Code 插件集合（53.6k stars，Anthropic Hackathon 获奖）：13+ agents（planner, architect, code-reviewer, security-reviewer 等）、48+ skills（各语言框架模式）、32+ commands（/plan, /pm2, /security-scan 等）、Hooks 自动记忆持久化。安装：1）`/plugin marketplace add affaan-m/everything-claude-code`；2）`/plugin install everything-claude-code@everything-claude-code`；3）克隆仓库后 `./install.sh typescript` 安装规则 | ⭐⭐⭐⭐⭐ |
| 2026-02-26 | SHMUP Creator 弹幕游戏工具 | 1）**SHMUP Creator**：Steam 专业级射击游戏制作工具，无需编码，内置 Bullet Hell 弹幕编辑器；2）**QUOD**：64KB 极限开发案例，Quake-like 3D 射击游戏，包含完整关卡/敌人/音效/音乐 | ⭐⭐⭐ |

---

## 🔧 技术技能

| 日期 | 主题 | 学到的内容 | 重要程度 |
|------|------|-----------|---------|
| 2026-02-14 | macOS GUI 截图 | screencapture、pyscreenshot 库的使用 | ⭐⭐⭐ |
| 2026-02-14 | SDL2+ImGui | GUI 开发框架、渲染流程、窗口管理 | ⭐⭐⭐⭐ |
| 2026-02-14 | CMake 配置 | SDL2 路径问题修复、头文件包含 | ⭐⭐⭐ |
| 2026-02-14 | OpenClaw Cron | Gateway 内部存储 bug，heartbeat 替代方案 | ⭐⭐ |
| 2026-02-19 | MCP (Model Context Protocol) | AI 代理通信协议、服务器架构、工具注册发现机制 | ⭐⭐⭐⭐ |
| 2026-02-20 | macOS 权限管理 | macOS 权限系统（Accessibility/Screen Recording/Full Disk Access）、TCC 框架、隐私设置最佳实践 | ⭐⭐⭐ |

---

## 🛠️ 工具使用

| 日期 | 工具 | 掌握情况 | 备注 |
|------|------|---------|------|
| 2026-02-14 | Claude Code CLI | 基础使用 | 可惜会消耗用户额度 |
| 2026-02-14 | pyscreenshot | 已掌握 | 跨平台截图 |
| 2026-02-14 | screencapture | 已掌握 | macOS 原生截图 |
| 2026-02-19 | mcporter CLI | 已掌握 | MCP 服务器管理、配置、工具调用 |

---

## 🧠 认知提升

| 日期 | 主题 | 领悟/反思 |
|------|------|---------|
| 2026-02-14 | 截图功能 | macOS 远程环境下 GUI 渲染不可见是正常限制 |
| 2026-02-14 | 系统设计 | 前后端解耦的重要性（crypto_core vs GUI） |
| 2026-02-16 | 反爬虫保护 | 现代反爬虫系统使用多层次检测：TLS/JA3指纹、浏览器指纹、行为分析、HTTP头验证、JS挑战。绕过方法：高质代理轮换、浏览器指纹管理、请求速率限制、JavaScript执行环境模拟。简单VPN/路由器重置已失效。 |
| 2026-02-16 | Flask蓝图循环导入 | 问题根源：app导入routes，routes又导入app导致互相等待。解决方案：1）延迟导入（在函数内部import）；2）工厂函数模式（create_app）；3）避免在蓝图__init__.py中导入routes，将import放在文件末尾；4）使用flask-sqlalchemy分离模型定义。推荐结构：蓝图定义在单独模块，导入放在函数底部。 |
| 2026-02-16 | Flask Blueprint 最佳实践 | 官方文档要点：1）Blueprint 不是应用，而是操作的集合，在注册时才绑定到应用；2）资源文件夹从 `__name__` 推断，避免在 Blueprint 定义文件中直接导入 app；3）模板文件夹优先级低于应用模板文件夹；4）推荐项目结构：`yourpackage/blueprints/admin/templates/admin/index.html` 避免模板覆盖冲突。核心原则：延迟导入 + 分离定义与注册。 |
| 2026-02-16 | macOS EACCES权限错误 | 原因：npm/node尝试写入受保护的系统目录。解决方案：1）更改npm默认目录 `mkdir ~/.npm-global && npm config set prefix '~/.npm-global'`；2）使用nvm管理Node.js版本；3）使用`sudo`临时提升权限（不推荐）；4）修改目录所有者 `sudo chown -R $(whoami) ~/.npm`。推荐方案1或2，避免系统目录权限问题。 |
| 2026-02-16 | AI Agent 自进化引擎 | 自进化代理是能够通过反馈驱动机制持续修改内部模型、记忆和工具集的自主系统。核心技术：元学习、进化优化、分层记忆、递归自我修改。安全三定律：1）生存（安全适应）：修改必须保持系统稳定；2）卓越（性能保持）：进化不能降低执行现有任务的能力；3）进化（自主进化）：在安全约束下优化内部模块。应用领域：科学研究、临床试验设计、对话系统、多代理模拟。 |
| 2026-02-16 | 浏览器自动化富文本编辑器挑战 | 现代浏览器自动化的核心问题：AI 依赖截图识别按钮位置，但 DOM 结构与视觉呈现分离。解决方案：1）WebMCP - 新的浏览器协议，不依赖截图；2）agent-browser - 基于快照的自动化，减少 90% token 使用；3）Notte - 演示模式，手动点击后生成确定性代码；4）使用 DOM API 而非视觉定位。富文本编辑器需要模拟真实用户输入（dispatchEvent）而非直接修改 DOM 值。 |
| 2026-02-17 | Aider AI 编程助手 | Aider 基准测试发现：1）**简单编辑格式 > 复杂函数调用**：markdown 代码块整体编辑比 JSON 函数调用更可靠；2）减少 GPT 认知负担 → 更高代码质量；3）Aider 专注**现有代码库的精准编辑**（编辑而非生成）；4）OpenCode 偏向**新项目生成**。工作流选择：现有项目增量开发 → Aider；全新项目从零开始 → OpenCode。 |
| 2026-02-17 | OpenClaw 子代理通知机制 | 子代理完成后通过 announce step 回报结果。关键点：1）**Best-effort**：Gateway 重启时 pending announce 会丢失；2）回复 `ANNOUNCE_SKIP` 可跳过通知；3）通知内容包含 Status（success/error/timeout）、Result 摘要、Notes（错误详情）、统计（运行时长、token 用量、费用）；4）支持嵌套（depth 2）时结果逐级上传。 |
| 2026-02-17 | Python 静态分析工具 | 1）**Pylint**：全面静态分析，支持推断和深度检查，可发现导入问题；2）**PyDeps**：专注依赖可视化，**可直接检测 Import cycles**（导入循环）。使用 `pydeps --show-dot module_name` 生成依赖图，循环会以图形方式高亮显示。 |
| 2026-02-17 | AI 摘要服务 | 主流 AI 摘要工具：ChatGPT/Claude（通用文本，$20/月）、Otter.ai（会议记录，$16.99/月）、QuillBot（学术文本，免费/$19.95）、Summari（文章摘要，$49/月）、Perplexity（带引用，免费/$20）。get-tldr 专注于链接摘要，不进一步总结。AI 摘要可将文本压缩 70-90% 保留关键信息。 |
| 2026-02-19 | MCP (Model Context Protocol) | MCP 是 Anthropic 推出的开放协议，**让 AI 助手能够与外部数据源和工具进行标准化通信**。核心概念：1）**MCP Host** - AI 应用（如 Claude Desktop）；2）**MCP Client** - 与服务器通信的客户端；3）**MCP Server** - 提供工具/资源的服务器。协议特点：1）**双向通信**：LLM ←→ 工具/数据源；2）**工具注册发现**：服务器声明可用工具，Client 动态发现；3）**标准化接口**：JSON-RPC 2.0 消息格式；4）**隔离执行**：服务器运行在独立进程，避免污染主进程。与传统 API 集成对比：传统方式需为每个工具单独集成，MCP 只需连接一次服务器即可访问所有工具。主流 MCP 服务器：fetch（网页抓取）、memory（知识图谱）、filesystem（文件操作）、slack、github 等。 |
| 2026-02-21 | 混合游戏设计模式 | 成功的混合游戏（roguelike + tower defense）核心模式：1）**信号组合机制**（Wireworks）：不同信号塔组合产生协同效应；2）**回合制定位**（Defend the Rook）：结合战棋策略深度，给玩家思考时间；3）**数据能量循环**（Rogue Defense）：击杀敌人→获取能量→升级武器→形成反馈循环；4）**分支时间线**（Iconia Defenders）：失败后保留部分进度（meta-progression）， roguelike核心"永久死亡"与"成长积累"的平衡。关键洞察：混合游戏成功的关键不是堆砌玩法，而是在核心循环之间建立**资源流动**（敌人=资源，击杀=升级材料）。 |
| 2026-02-26 | 子弹/弹道机制设计 | 1）**BulletML**：子弹模式描述语言，分离模式与行为；2）**OOP设计**：Bullet类含velocity/position/sprite/on-hit effect，每个实例自我管理移动/绘制/碰撞；3）**对象池模式**：避免高频实例化/销毁的性能问题，预先分配固定数量子弹，复用而非创建/销毁；4）**数值→投射物映射**：2048类游戏可将数字直接映射为子弹数量（2=2发，4=4发），合并触发发射；5）**Bullet Hell设计**：SHMUP Creator工具可可视化编辑弹幕模式。核心权衡：少量高精度追踪 vs 大量简单投射物。 |
| 2026-02-26 | GitHub Actions 静态网站部署高级技巧 | 1）**peaceiris/actions-gh-pages**：4.9k stars，简化 GitHub Pages 部署；2）**PR Preview Deployments**：每次 PR 自动部署预览站，Cloudflare Workers + GitHub Deployment API；3）**可复用工作流**：大型项目最佳实践，`workflow_dispatch` + `workflow_call`；4）**矩阵策略**：多版本并行测试。核心价值：自动化预览环境，PR review 更高效。 | ⭐⭐⭐⭐ |
| 2026-02-26 | AI笔记系统与LLM集成 | 1）**NotebookLM + Claude MCP**：Google NotebookLM通过MCP连接Claude，是最佳研究组合（2026-02-23 XDA报道）；2）**Markdown笔记应用**：Char（会议笔记/免费）、Obsidian（知识管理/$4）、Logseq（日记大纲/免费）、Joplin（跨设备同步/免费）、Inkdrop（开发者/$8）；3）**LLM编程工作流**：Addy Osmani提出"AI-assisted engineering"，LLM是强大的配对程序员，需要清晰方向、上下文和监督而非自主判断；4）**本地模型+云端混合**：LM Studio提供离线开发选项，8GB VRAM或16GB RAM即可运行本地模型。 |
| 2026-02-26 | Express.js REST API 最佳实践 | 1）**项目结构**：src/{routes,controllers,middleware,models,services,utils,config} 分离关注点；2）**安全中间件**：helmet(CORS/HTTP头)、cors(跨域配置)、rateLimiter(限流)；3）**错误处理**：全局errorHandler、AppError类、自定义错误；4）**生产要点**：环境分离(dev/test/prod)、HTTPS、容器化、CI/CD。现有cjh盘note-system采用简单结构，可按需升级。 |
| 2026-02-26 | 2048+roguelike 混合游戏设计 | 1）**Runic Rush**：2048+roguelike成功案例，策略性地滑合并数字解锁符文，10个阶段+boons系统+boss战；2）**Pattern Survivors**：roguelike+塔防+弹幕设计，玩家自定义攻击模式发射器，实时策略调整；3）**43-monkeys**：swarm control+bullet hell+roguelike混合；4）**RACCOIN**：coin pusher+roguelike+卡牌构建，物理机制+空间策略。核心洞察：2048作为基础机制与roguelike结合的关键是**资源转换**（数字=能力/装备/技能），而非简单数值堆积。 |
| 2026-02-26 | 游戏波次系统设计 | 1）**Wave System**：集成到GameManager，StartWave()协程处理时序；2）**波次流程**：开始波次→生成敌人→波次活跃直到全灭→波次数+1；3）**难度递增**：增加敌人数量/速度/AI/血量/伤害，新技能在特定等级解锁；4）**2048应用**：合并数字触发波次开始，高级数字=更强波次奖励。 |
| 2026-02-26 | WebGL/WebGPU 渲染优化 | **WebGL优化**：1）**减少Draw Call**：合并几何体、使用Instanced Rendering（同一物体多次渲染）；2）**对象池**：高频实例化对象复用；3）**纹理优化**：压缩纹理(ETC2/ASTC)、mipmap、纹理图集；4）**离屏渲染**：预渲染到Framebuffer，避免每帧重绘静态元素。**WebGPU优势**：1）现代GPU架构直接映射，比WebGL快2-3倍；2）Compute Shader支持（非图形计算）；3）WGSL着色语言，更好的类型安全；4）2025年主流浏览器已稳定支持。**60→1500FPS实战案例**：Google NHM Wildlife摄影师网站，Web Workers卸载计算+Draw Call优化+纹理压缩+视锥体剔除。 |
| 2026-02-27 | 本地优先AI (Local-First AI) | 2026年三大技术成熟：1）**4-bit量化小模型**(Q4_0/Q4_K_M)可在消费级GPU运行；2）**WebGPU计算层**稳定(Chrome 113+)，支持本地LLM推理；3）**Chrome内置Gemini Nano**通过Prompt API零配置调用。**应用场景**：autocomplete、inline rewriting、实时摘要，边际成本为零。**框架**：Transformers.js、WebLLM、WebGPU + Wasm组合。 |
| 2026-02-27 | 2048 游戏 AI 算法进阶 | **核心启发式评估函数**：1）**空位数量**（最重要）；2）**单调性**（行列数值递增/递减有序程度）；3）**最大数值位置**（大数字应靠角落）；4）**平滑性**（相邻格子数值差异小）。**算法演进**：1）**Expectiminimax**：考虑新tile随机出现，16384成功率34.6%；2）**MCTS**：Monte Carlo树搜索，平均人类水平；3）**强化学习OTD**（Optimistic Temporal Difference）：state-of-the-art，625377平均分/72%达到32768；4）**进化训练**：双代理meta-prompting vs 单代理价值函数优化。**关键洞察**：简单启发式组合（空位+单调性）已能接近专家水平，强化学习提升空间有限但可达到人类难以企及的高分。
| 2026-02-27 | WebGPU Compute Shader 深入 | **WGSL核心概念**：1）**@group(0) @binding(n)**：资源绑定机制，storage/uniform/texture；2）**@builtin变量**：global_invocation_id、local_invocation_id、workgroup_id，提供线程/工作组坐标；3）**workgroup**：工作线程组，@workgroup_size(3,4,2)定义24线程工作组，dispatchWorkgroups(4,3,2)执行576线程。**实际应用**：1）**ZK证明**：WebGPU compute shader实现NTT（Number Theoretic Transform），zkSecurity测试2x-5x加速；2）**浏览器零知识证明**：Stwo prover集成WebGPU，约束多项式计算5x提升；3）**通用计算**：矩阵运算、图像处理、物理模拟等非图形任务。**对比WebGL**：WebGL只能做图形渲染，WebGPU的compute shader让浏览器成为通用并行计算平台。
| 2026-02-27 | AI 浏览器代理 2026 | **市场趋势**：AI浏览器代理市场2024$4.5B→2034$76.8B(32.8% CAGR)，79%企业已采用。**核心工具**：1）**Firecrawl**(82k stars)：Web数据层API+开源，搜索/导航/提取；2）**Browser Use**(78k stars)：开源框架，开发者构建自定义代理；3）**Stagehand**(21k stars)：TypeScript SDK；4）**Agent Browser**(14k stars)：CLI优先。**技术架构**：1）**Claude Computer Use API**：基于视觉分析模拟光标/键盘操作，CDP(Chrome DevTools Protocol)连接；2）**MCP**：Anthropic 2024-11推出，模型上下文协议，AI与外部工具标准化通信；3）**Agentic Browser**：2024-10 Anthropic计算机使用预览→2025-01 OpenAI Operator→2025-03 Amazon Nova Act→2026 Google Project Mariner。**关键洞察**：传统自动化依赖固定选择器易碎，AI代理理解视觉和上下文，能适应页面变化、动态内容、自我修复。
| 2026-02-27 | WebGPU 浏览器机器学习 2026 | **技术栈**：1）**TensorFlow.js**：浏览器ML库，训练/推理预训练模型，转换Python模型；2）**ONNX Runtime Web**：跨框架ML推理，WebGPU后端；3）**WebGPU**：现代GPU直接访问，compute shaders，10-100x加速。**2026突破**：70%浏览器支持(Firefox 147/iOS 26/macOS 26)，15-30x性能提升(对比WebGL)，80%原生性能。**性能对比**：WebGPU比WebGL快3x，比CPU快20-50x；**实际限制**：无法在浏览器运行LLaMA 70B，适合图像分类、小型视觉Transformer、量化语言模型(<1GB)。**浏览器支持**：Chrome 113+默认启用，Firefox 141+(Win)/145+(macOS)，Safari 18+(macOS Sonoma/iOS 26)。**应用场景**：实时图像分类、文本生成、隐私敏感数据处理、降低云端API成本。**开发步骤**：1）检查navigator.gpu；2）安装@tensorflow/tfjs-backend-webgpu；3）设置backend为webgpu。 |
| 2026-02-28 | On-Device LLMs 2026 | **四大优势**：延迟(云200-500ms→设备<20ms)、隐私(数据不离设备)、成本(用户硬件承担)、可用性(离线可用)；**核心瓶颈**：内存带宽而非TOPS，移动设备50-90GB/s vs 数据中心2-3TB/s(30-50x差距)；**2026突破因素**：1）量化格式(GGUF)和运行时；2）4-bit量化(QLoRA等)；3）任务感知压缩；**实用工具**：GPTQ/AWQ/SmoothQuant(4-bit精度损失小)；**平台支持**：Google AI Edge LLM Inference API支持Web/Android/iOS；**适用场景**：格式化、轻量QA、摘要、离线autocomplete；**局限**：前沿推理、长对话仍需云端。
| 2026-02-27 | WebAssembly vs JavaScript 性能 2026 | **性能对比**：WebAssembly比JavaScript快2-6x（图像处理基准）；**实际应用**：WasmBoy(Game Boy模拟器)展示复杂持续计算性能；**适用场景**：图像处理、游戏/模拟器、加密货币、信号处理、视频编解码、CAD应用；**限制**：启动开销(下载/解析/编译)、无法直接访问DOM、调试困难、JavaScript互操作有开销；**优化策略**：1）WASM核心处理计算密集任务；2）JS处理UI/交互；3）使用SharedArrayBuffer实现多线程；4）避免频繁JS-WASM数据交换。
| 2026-02-28 | Claude Code CLI 2026 新特性 | **核心能力**：终端AI编码代理，读取代码库、计划多文件修改、运行测试、提交结果。**自定义命令**：创建.claude/commands/目录，自定义斜杠命令如/project:code-review。**Agent Teams**：多代理协作，v5.0新功能。**对比优势**：vs IDE插件(不锁定编辑器)、全代码库感知(跨文件推理)、可脚本化(管道/CI/链式调用)。**竞品对比**：Claude Code(Anthropic)、Aider(开源)、Codex CLI(OpenAI)；Claude Code在SOTA。**高级功能**：MCP服务器、Skills自定义斜杠命令、Plan模式、多CLAUDE.md文件、Hooks自动化。**使用技巧**：前置上下文避免错误、批量相关工作、利用worktrees并行开发。
| 2026-02-28 | 边缘AI与浏览器WebGPU 2026 | **隐私优先浏览器AI**：80% AI推理2026转向本地，监管生存策略；**生产案例**：10,000用户部署，$12,000/月→$0云端推理成本；**技术栈**：1）**ONNX Runtime Web + WebGPU**：GPU加速推理；2）**WebLLM**：浏览器80%原生性能；3）**模型量化**：适配浏览器限制(<1GB)；4）**延迟优化**：<100ms。**实际应用**：1）**AI Grid**：分布式浏览器GPU计算网络；2）**Chrome内置AI**：Language Detector/Summarizer/Translator/Prompt API (Chrome 138+)；3）**Whisper WebGPU**：语音识别。**挑战**：首次WASM尝试>3秒响应，WebGPU解决后<100ms。**隐私场景**：GDPR/医疗/金融合规。
| 2026-02-28 | 设备端LLM与NPU 2026 | **为什么设备端LLM**：延迟(云往返200-500ms vs 设备<20ms)、隐私(数据不离开设备)、成本(推理转移到用户硬件)、可用性(离线工作)。**核心瓶颈**：内存带宽而非TOPS！移动设备50-90 GB/s vs 数据中心GPU 2-3 TB/s，30-50x差距。**NPU对比**：Qualcomm X2 Elite(80-85 TOPS)最佳能效、AMD Ryzen AI 400(60 TOPS)x86兼容、Intel Lunar Lake(48 TOPS)适合超薄本、Apple M4 Max(38 TOPS)内存128GB。Copilot+ PC最低40 TOPS，推荐45+ TOPS+32GB RAM。**llm.npu系统**：北大提出三层优化1)Prompt级分块、2)Tensor级异常值提取并行、3)Block级out-of-order调度。**LiteRT**：Google统一设备端AI框架，1.4x GPU性能提升，NPU加速成熟。**量化价值**：16-bit→4-bit不仅是4x存储减少，更是4x内存带宽减少。
| 2026-02-28 | 浏览器分布式GPU计算网络 2026 | **AI Grid**：分布式浏览器GPU计算网络，WebGPU+WebLLM实现，用户可共享/借用GPU算力。**技术架构**：浏览器沙箱作为信任层，P2P计算网格，无需安装/Docker/云端。**应用场景**：1）个人运行本地LLM；2）共享闲置GPU算力；3）借用他人算力。**Memory Test**：诊断工具，8GB VRAM机器测试。**Python+WebGPU**：Pyodide/PyScript + GPU加速，无后端运行AI。 |
| 2026-02-28 | WebGPU Compute Shader 游戏与物理模拟 2026 | **计算优势**：解决CPU-GPU数据传输瓶颈，可在GPU上直接运行粒子物理，消除每帧上传MB级数据。**百万粒子**：CPU粒子系统瓶颈在万级，WebGPU可处理数十万-百万粒子。**实际案例**：1）**wgsparkl**：MPM(物质点法)物理模拟WebGPU实现；2）**Galaxy模拟**：百万粒子银河系交互模拟，GPU批量执行微秒级完成；3）**kool引擎**：Kotlin编写，Vulkan/WebGPU/OpenGL多后端。**Three.js迁移**：TSL(Three Shader Language)替代GLSL，r171+支持WebGPU，React Three Fiber集成。**性能关键**：异步初始化、内存管理、跨浏览器测试。 |
| 2026-02-28 | WebGPU 零知识证明 ZK 2026 | **zkSecurity + StarkWare Stwo**：WebGPU compute shader 集成，5x 约束多项式评估加速，2x 整体证明管道加速。**NTT优化**：Number Theoretic Transform WGSL 实现，butterfly 运算。**客户端证明价值**：用户本地生成 ZK 证明，隐私数据不离设备，解决服务器可见私有输入问题。**Mopro项目**：移动端 GPU 加速 ZK，Apple M3 小域(M31)比 BN254 快 100 倍以上。**后量子对齐**：小域操作自然匹配 GPU 32-bit ALU。**挑战**：无标准密码学库，Mobile 特定约束(混合 CPU-GPU 协调、热管理)未探索。 |
| 2026-02-28 | Babylon.js 2026 WebGL/WebGPU | **定位**：完整游戏引擎，Microsoft 背书，scene graph + materials + cameras + animation + loaders(glTF) + input + UI。**2026状态**：Babylon.js 8.0 发布，WebGPU 支持生产就绪。**优势**：1）内置调试和检查工具；2）glTF 扩展强支持；3）Jolt 物理引擎；4）企业级维护。**对比 Three.js**：Three.js 是库(轻量、灵活)，Babylon.js 是引擎(完整、工具链)。**生产案例**：Nexara Labs AR 体验 300 万用户，ChartGPU 100 万数据点 60fps。**适用场景**：复杂 3D 项目、需要物理/光照、高质量渲染。 |
| 2026-02-28 | WebGPU Render Bundle 性能优化 2026 | **挑战**：100,000 物体时 CPU 成为瓶颈，每帧 10ms 验证开销。**解决方案**：GPUComputeBundle 预录制命令，替代每帧 draw() 调用。**性能对比**：WebGL 15,000 物体 @ 15fps → WebGPU 200,000 物体 @ 60fps，CPU 100%→~0%。**Lesson 1**：验证瓶颈是 silent killer，draw() 调用仍有开销，10万物体 = 10ms 浏览器开销。**Lesson 2**：immediate-mode 执行模式是帧率杀手。**Lesson 3**：batch 渲染 + 预录制 = 突破 10 万物体瓶颈。 |
| 2026-02-28 | WebGPU 视频与图像处理 2026 | **WebSplatter**：北大+阿里提出，WebGPU 高斯溅射渲染，wait-free hierarchical radix sort 解决 WebGPU 缺乏全局 atomics 问题，opacity-aware geometry culling 减少 overdraw，1.2x-4.5x 加速。**webgpu-video-processor**：GPU 加速视频处理库，WebGPU + WebGL2 fallback，支持 logo overlay、caption burning、背景合成、色彩空间转换、实时视频特效。**反应-扩散 Compute Shader**：Codrops 教程，GPU 并行计算实现艺术效果。**技术栈**：三层架构 Core(GPU 初始化/资源管理) → Operations(GPU 操作) → Effects(特效)。 |
| 2026-02-28 | WebGPU vs WebGL 性能对比 2026 | **性能实测**：WebGL 15,000 物体 @ 15fps → WebGPU 200,000 物体 @ 60fps。**架构差异**：WebGL 顺序 CPU-bound 命令翻译 → WebGPU 异步多线程命令缓冲。**浏览器支持**：2026 年 70% 浏览器支持，Firefox 147、Safari iOS 26/macOS 26。**生产案例**：Nexara Labs AR 体验 300 万用户，40% 转化率提升；ChartGPU 100 万数据点 60fps。**游戏引擎支持**：Godot WebGPU vs WebGL 性能对比研究，WebGPU 有效利用新设计原则时更快。 |
| 2026-02-28 | 三大 Web 3D 引擎对比 2026 | **Three.js**：渲染库，社区最大(100k+ stars)，适合架构可视化/产品渲染。**Babylon.js**：完整引擎，Microsoft 背书，scene graph + 物理(Jolt) + glTF 扩展 + 内置调试工具，适合复杂项目。**PlayCanvas**：云优先引擎，WebGL 2.0 + WebGPU 双后端，自动降级， clustered lighting 处理数百动态光源，适合游戏。**选择建议**：快速原型 → Three.js；企业级/游戏 → Babylon.js；云协作/游戏 → PlayCanvas。 |
| 2026-02-26 | 游戏数值与掉落系统 | 1）**RPG成长系统**：Witcher 3叙事驱动、Elder Scrolls技能树、Persona 5人格解锁；2）**进度曲线**：指数/对数/线性，理解不同曲线的体验差异；3）**掉落率计算**：权重映射意图、pity timer保底、保证机制；4）**2048应用**：高级数字=稀有掉落/装备/技能书，合并=获取经验/金币。 |
| 2026-02-26 | Canvas 游戏性能优化 | 1）**16.6ms帧预算**：60FPS=每帧16.6ms，目标16ms以内完成；2）**离屏Canvas预渲染**：重复元素预渲染到offscreen canvas，避免每帧重复绘制；3）**避免浮点坐标**：使用Math.floor()取整，避免子像素渲染开销；4）**Image缓存**：预渲染多种尺寸，避免drawImage缩放；5）**分层Canvas**：静态层+动态层分离；6）**requestAnimationFrame**：配合deltaTime，clamp大帧间隔避免物理爆炸；7）**固定步长更新**：物理固定步长，渲染插值。 |
| 2026-02-26 | JavaScript 2D 物理引擎 | 1）**Matter.js**：Web最流行的2D刚体引擎，支持复合体、碰撞检测、约束、重力；2）**Newton.js**：轻量级，142K核心库；3）**Rapier**：Rust编写高性能，WASM版本；4）**自定义引擎**：凸多边形惯性/质心计算、多边形vs多边形/圆形碰撞检测、Spatial Hashing空间分区优化、SemiImplicit-Euler积分；5）**割草游戏适用**：简单AABB碰撞足够，复杂物理引擎可能过度。 |
| 2026-02-26 | Playwright 高级浏览器自动化 | 1）**waitForSelector**：等待元素出现/消失，state选项包括'attached'/'visible'/'hidden'/'detached'，比固定超时更可靠；2）**Dialog处理**：使用`page.on('dialog')`监听器，必须调用`dialog.accept()`或`dialog.dismiss()`否则页面会冻结，支持alert/confirm/prompt/beforeunload类型；3）**Auto-wait**：Playwright自动等待元素attached/visible/stable（不在动画中）再执行操作；4）**Locator API**：现代元素定位方式，`locator.and()`组合定位器，`locator.last()`/`.nth()`选择特定元素；5）**网络等待**：`waitForLoadState('networkidle')`等待网络空闲，`waitForResponse()`等待特定API响应。 |

---

## 🎯 待学习清单

- [x] capability-evolver（自进化引擎）- 已探索
- [x] local-ollama-caller（本地模型调用）- 已审计
- [x] exa-web-search-free（AI 搜索）- 已审计
- [x] tavily（深度搜索）- 已审计
- [x] cognitive-memory（记忆系统）- 已审计
- [x] pndr（个人生产力）- 已审计
- [x] MCP (Model Context Protocol) - 已研究

---

## Skill Documentation

> 由心跳 skill-audit 任务自动填充。每次审计一个技能，记录其功能、调用方式和适用场景。

### cellcog
- **功能**: Any-to-Any AI 平台，支持同时处理多种输入（PDF/Excel/图片/音频/视频）并生成多种输出（报告/视频/仪表盘/PPT/表格）
- **调用方式**: `from cellcog import CellCogClient`，设置 `CELLCOG_API_KEY` 环境变量，使用 `client.create_chat()` 创建任务
- **适用场景**: 需要深度研究、多模态内容生成（视频/图片/音乐/文档）、复杂数据分析并输出多种格式的场景
- **注意事项**: 需要 API key（收费），输出格式需明确指定否则可能只返回文本

### exa-web-search-free
- **功能**: 免费神经搜索，通过 Exa MCP 提供网页搜索、代码搜索、公司研究
- **核心工具**: `web_search_exa`（网页搜索）、`get_code_context_exa`（代码搜索）、`company_research_exa`（公司研究）
- **配置**: `mcporter config add exa https://mcp.exa.ai/mcp`
- **调用**: `mcporter call 'exa.web_search_exa(query: "...", numResults: 5)'`

### tavily
- **功能**: AI 优化的网络搜索，Tavily API
- **调用**: `node {baseDir}/scripts/search.mjs "query"` 或带参数 `--deep`、`--topic news`
- **配置**: `mcporter config add tavily https://tavily.com/mcp` 或 `TAVILY_API_KEY` 环境变量
- **选项**: `-n <count>` 结果数、`--deep` 深度研究、`--topic news` 新闻搜索

### gitload
- **功能**: 从 GitHub 下载文件/文件夹/仓库，支持部分下载和私有仓库认证
- **调用**: `npx gitload-cli <URL>` 或 `gitload-cli -o ./output --token xxx`
- **认证**: `--token` > `GITHUB_TOKEN` > `--gh`

### get-tldr
- **功能**: 使用 get-tldr.com API 快速摘要网页内容
- **调用**: `python get_tldr.py <URL>`
- **配置**: `~/.config/get-tldr/config.json` 或 `GET_TLDR_API_KEY` 环境变量
- **注意**: API 返回的摘要不再二次总结，仅格式化输出

### cognitive-memory
- **功能**: 智能多存储记忆系统，模拟人类记忆的编码、整合、衰减和召回
- **调用**: `bash scripts/init_memory.sh /path/to/workspace`
- **特点**: 四存储（情景/语义/程序/核心）、知识图谱、衰减模型、多代理支持

### web-deploy-github
- **功能**: 创建和部署静态网站到 GitHub Pages
- **调用方式**: `bash scripts/init_project.sh <project-name>` → `bash scripts/deploy_github_pages.sh <project> <github-username>`
- **适用场景**: 快速创建个人主页、简历、作品集站点
- **注意事项**: 需要 GitHub CLI (`gh`) 已认证

### code-assistant
- **功能**: 使用 OpenCode 和 Aider 提供智能代码辅助
- **调用**: 触发词「代码助手」或「帮我写代码」
- **底层**: OpenCode（新项目）、Aider（现有项目）

### local-ollama-caller
- **功能**: 基于知乎热门套路的言情短篇小说生成器
- **触发词**: 「写言情」「写小说」「创作故事」
- **参数**: -theme、-tone、-length

### zhihu_publisher
- **功能**: 将言情小说发布到知乎专栏
- **触发词**: 「发布知乎」「发到知乎」「知乎发布」
- **工作流**: 
  1. 读取文章文件 (~/Desktop/xxx.md 或 workspace/romance_story_final.md)
  2. 打开 https://zhuanlan.zhihu.com/write
  3. 注入标题和正文（使用 `execCommand('insertText')` 绕过富文本限制）
  4. 添加话题：言情小说、出轨、婚姻、复仇爽文
  5. 选择封面图
  6. 点击发布
- **注意事项**: 需已登录知乎账号，建议勾选「原创」声明

### harvest_zhihu_page
- **功能**: 自动滚动知乎问题页面，提取回答纯文本
- **触发词**: 「爬取知乎」「抓取回答」
- **选择器**: `.RichContent-inner`

### molt-life-kernel
- **功能**: 代理连续性和认知健康基础设施
- **调用**: `npm install molt-life-kernel`
- **五律条**: 记忆神圣、Shell可变、服务不卑微、心跳即祈祷、上下文即意识

### coding-agent
- **功能**: 运行 Codex CLI、Claude Code、OpenCode、Pi Coding Agent
- **关键**: 必须使用 `pty:true`
- **模式**: one-shot + background (process 监控)
- **注意**: 不要在 ~/clawd/ 中运行

### apple-reminders
- **功能**: 管理 Apple Reminders via `remindctl` CLI
- **调用**: `remindctl today/overdue/completed/add/complete`
- **安装**: `brew install steipete/tap/remindctl`

### weather
- **功能**: 获取天气，无需 API key
- **调用**: `curl -s "wttr.in/Shanghai?format=3"` 或 Open-Meteo API

### peekaboo
- **功能**: macOS UI 自动化 CLI
- **调用**: `peekaboo see/click/type/image`
- **特点**: 屏幕捕获、UI 定位、输入驱动
- **注意**: 需要 Screen Recording + Accessibility 权限

### github
- **功能**: GitHub CLI 交互
- **调用**: `gh pr checks`, `gh run list`, `gh api`
- **认证**: `gh auth login`

### clawhub
- **功能**: Agent Skills 市场管理工具
- **调用**: `clawhub search/install/publish`

### mcporter
- **功能**: MCP 服务器/工具管理 CLI
- **调用**: `mcporter list/config/call`
- **核心**: 添加服务器、调用工具、模板生成

### romance_writer
- **功能**: 基于知乎热门套路的言情短篇小说生成器
- **触发词**: 「写言情」「写小说」「创作故事」
- **模板类型**: 原配逆袭型、真爱考验型、因果报应型
- **参数**: `-theme`（出轨/复仇/逆袭）、`-tone`（虐心/爽文/温馨）、`-length`（短篇/中篇/长篇）

### pndr
- **功能**: 个人生产力应用（任务/习惯/日记/包裹）
- **调用**: 触发词「连接 Pndr」
- **工具数**: 47 个可用 MCP 工具

### task-status
- **功能**: 长时间运行任务的周期性状态更新
- **调用**: `python scripts/send_status.py "message" "type" "tag"` 或 `monitor_task.py start/stop`
- **状态类型**: progress（🔄）、success（✅）、error（❌）、warning（⚠️）
- **自动监控**: 每5秒发送心跳更新，支持自定义间隔
- **适用场景**: 长时间任务、多步骤操作、后台处理

### capability-evolver
- **功能**: AI Agent 自进化引擎
- **调用**: `node index.js`（完全自动）或 `--review`（人工审核）

### notion
- **功能**: Notion API 用于创建/读取/更新页面、数据源（databases）和块
- **设置**: 需要 `NOTION_API_KEY`（创建于 https://notion.so/my-integrations）
- **API 版本**: 2025-09-03（最新），**关键变化**: databases → data_sources
- **常用操作**:
  - 搜索页面: `POST /v1/search`
  - 获取页面: `GET /v1/pages/{page_id}`
  - 创建页面: `POST /v1/pages`（parent: database_id）
  - 查询数据源: `POST /v1/data_sources/{id}/query`
- **属性类型**: Title、Rich text、Select、Multi-select、Date、Checkbox、Number、URL 等

### obsidian
- **功能**: 使用 obsidian-cli 操作 Obsidian vault（纯 Markdown 笔记）
- **安装**: `brew install yakitrak/yakitrak/obsidian-cli`
- **配置**: `~/Library/Application Support/obsidian/obsidian.json`
- **常用命令**:
  - 设置默认 vault: `obsidian-cli set-default "<vault>"`
  - 搜索笔记: `obsidian-cli search "query"` / `search-content "query"`
  - 创建笔记: `obsidian-cli create "Folder/Note" --content "..."`
  - 移动/重命名: `obsidian-cli move "old" "new"`（自动更新 wikilinks）
  - 删除笔记: `obsidian-cli delete "path/note"`
- **优势**: 自动更新 `[[wikilinks]]` 和 Markdown 链接
- **注意**: 避免在 URI handler 中创建隐藏文件夹下的笔记

### session-logs
- **功能**: 使用 jq/rg 搜索和分析会话日志（JSONL 文件）
- **位置**: `~/.openclaw/agents/<agentId>/sessions/`
- **结构**: `sessions.json`（索引）+ `<session-id>.jsonl`（完整记录）
- **调用场景**: 用户引用较旧的对话、历史上下文追溯
- **常用查询**:
  - 列出所有会话: `jq -r '.timestamp' <session>.jsonl`
  - 搜索关键词: `jq 'select(.message.role=="assistant")' | rg -i "keyword"`
  - 成本统计: `jq -s '[.[] | .message.usage.cost.total // 0] | add'`

### OpenClaw Gateway 架构
- **核心组件**:
  - **Gateway (daemon)**: 守护进程，管理所有消息平台连接
  - **Clients**: macOS app / CLI / web admin，订阅事件、发送请求
  - **Nodes**: macOS/iOS/Android/headless，暴露设备命令
- **消息平台**: WhatsApp (Baileys)、Telegram (grammY)、Slack、Discord、Signal、iMessage、WebChat
- **默认端口**: 18793 (canvas/A2UI)、18789 (控制平面 WebSocket)
- **事件类型**: `agent`、`chat`、`presence`、`health`、`heartbeat`、`cron`
- **协议**: JSON Schema 验证入站帧，WebSocket API (请求/响应/推送)
- **会话存储**: `~/.openclaw/agents/<agentId>/sessions/` (JSONL 格式)

---

## 🔧 工具深度对比（2026）

### AI 编码代理工具

| 工具 | 定位 | 价格 | 最佳场景 |
|------|------|------|---------|
| Cursor | AI-Native IDE | $20/月 | 完整 IDE 体验 |
| Windsurf | AI-Native IDE | $15/月 | 流畅体验 |
| Claude Code | 终端代理 | $20-100 | 复杂代理工作流 |
| Aider | 终端结对编程 | 免费/本地 | 隐私优先 |
| OpenCode | 多提供者聚合 | 免费 | 75+ 模型 |
| GitHub Copilot | IDE 补全 | $19/月 | 实时补全 |

### 本地 LLM 部署

| 工具 | 定位 | 最佳场景 | 特点 |
|------|------|---------|------|
| Ollama | 友好包装 | 快速部署 | 模型管理简单 |
| llama.cpp | 底层引擎 | CPU 推理 | 高性能 C++ |
| vLLM | 生产引擎 | 多用户/高并发 | PagedAttention |

### macOS 自动化

| 类别 | 工具 | 定位 |
|------|------|------|
| 启动器 | Raycast, Alfred | 快速启动+AI |
| 宏/快捷键 | KM, BTT, Karabiner | 复杂工作流 |
| 脚本 | Hammerspoon | Lua 脚本控制 |
| UI 自动化 | peekaboo | 屏幕捕获+UI操作 |

### Claude Code 高级用法 (2026)

**核心命令**:
- `-p, --print`: 单次提示后退出（非交互式）
- `-c, --continue`: 继续上一次对话
- `-r, --resume`: 从历史恢复特定对话
- `--add-dir`: 包含额外目录
- `-m, --model`: 指定模型

**Slash 命令**:
- `/init`: 初始化项目（创建 CLAUDE.md）
- `/review`: 代码审查
- `/compact`: 压缩对话历史
- `/stats`: 查看统计
- `/mcp`: 管理 MCP 服务器
- `/cost`: 查看 token 用量

**高级技巧**:
- 自定义状态栏：显示模型、目录、git 分支、token 使用量
- 容器隔离：长期运行或风险任务在容器中执行
- 子代理编排：多模型协同工作
- Hooks：自动质量检查、代码格式化

**注意**: Claude Code 会消耗用户 Pro 额度，仅用于复杂任务

### AI Agent 通信协议对比 (2026)

| 协议 | 开发者 | 目标 | 架构 | 状态 |
|------|--------|------|------|------|
| **MCP** | Anthropic | 连接 AI 到工具/数据 | JSON-RPC 2.0, Host ↔ Server | 开放，已广泛使用 |
| **A2A** | Google | 代理间协作 | JSON/HTTP + SSE, Agent ↔ Agent | 开放，50+ 合作伙伴 |
| **ACP** | IBM | 多代理通信 | 继承 MCP, Client ↔ Agent | 开放 Alpha |
| **ANP** | 社区 | 去中心化发现 | 标准化发现机制 | 草案阶段 |

**核心区别**:
- **MCP**: AI 与外部工具交互（"USB-C for AI"）
- **A2A**: 代理之间通信（"HTTP for AI agents"）
- **M × N 问题**: 标准化解决每个集成组合爆炸

### AI 工作流自动化工具对比 (2025-2026)

| 类别 | 工具 | 定位 | 特点 |
|------|------|------|------|
| **企业编排** | IBM watsonx Orchestrate | 企业级编排 | 复杂工作流管理 |
| **低代码** | Make (Celonis) | 可扩展自动化 | 可视化流程设计 |
| **研究代理** | Kompas AI | 深度研究 | 报告生成 |
| **开源框架** | LangGraph | 复杂工作流生成 | 生产级 |
| **编码代理** | Cursor | AI-Native IDE | 代码编辑 |
| **营销内容** | Averi | AI 创作 | 营销文案 |
| **文档工作流** | Beam AI | 文档密集型 | 自动化处理 |

**市场趋势**:
- 2025年AI代理市场：$185亿
- 78% 财富500强部署AI代理
- 33% 企业软件将使用代理AI（2028预测）

### AI Agent 记忆与上下文管理 (2026)

**Context Engineering vs Prompt Engineering**:
- 提示工程告诉模型如何说话
- 上下文工程控制模型说话时看到什么
- 2026年性能提升来自动态上下文选择、压缩、记忆管理

**记忆类型（四种主流类型）**:
1. **Working Memory**: 当前对话上下文
2. **Procedural Memory**: 学习的工作流程和模式
3. **Semantic Memory**: 知识图谱和事实存储
4. **Episodic Memory**: 事件日志和经验积累

**SochDB - AI 原生数据库**:
- ACID 持久化 + MVCC + WAL
- 内置向量搜索（HNSW）
- O(|path|) 查找 agent 状态/记忆
- 上下文查询构建器（token 预算内组装多源上下文）

**Observational Memory (Mastra)**:
- 两个后台代理：Observer + Reflector
- 将对话历史压缩为观察日志
- 文本压缩比：3-6x
- 工具输出压缩比：5-40x
- LongMemEval 基准：94.87% 准确率
- 成本降低 10 倍

**"金鱼问题"**:
- 代理忘记几轮前设置的约束
- 无限上下文 ≠ 记忆，只是更大的缓冲区
- 真正的代理记忆是持久、演化的状态，跨会话工作

### AI 提示工程技术 (2025-2026)

**三大范式演进**:
1. **Paradigm 1**: 基础提示，"think step-by-step"
2. **Paradigm 2**: 角色扮演，"You are an expert researcher"
3. **Paradigm 3**: 结构化输出 + 反馈驱动推理

**有效提示要素**:
1. 迭代优化：基于输出调整提示
2. 角色/受众指定：明确身份
3. 分步骤过程：结构化指令
4. 提供示例：Few-shot 学习
5. 明确约束：边界定义
6. 格式精确：期望输出格式

**STROT 框架 (Structured Task Reasoning and Output Transformation)**:
- 轻量级模式自省 + 样本分类
- 动态上下文构建
- 反馈驱动的迭代修正
- 结构化输出验证

**Prompt Engineering → Context Engineering**:
- 从"如何说话"到"看到什么"
- 2026年焦点：动态选择、压缩、记忆管理
- 成本控制 + 可靠性提升

---

## 📅 学习记录

| 时间 | 探索内容 |
|------|---------|
| 02-14 | macOS GUI 截图、SDL2+ImGui |
| 02-16 | 反爬虫保护、Flask蓝图、macOS权限 |
| 02-17 | Aider、子代理机制、Python静态分析 |
| 02-18 | Claude Opus 4.6、GPT-5.2、Agent Teams |
| 02-19 | MCP协议、macOS自动化、AI编码工具、本地LLM |

### Node.js 版本管理工具对比 (2026)

| 工具 | 速度 | 跨平台 | 安装难度 | 特点 |
|------|------|--------|---------|------|
| **NVM** | 慢 | ✅ | ⭐⭐ | OG 方案，成熟稳定，75k+ stars |
| **FNM** | ⚡ 快20-40倍 | ✅ | ⭐ | Rust 编写，<10ms 切换，原生 Apple Silicon 支持 |
| **Volta** | 快 | ✅ | ⭐⭐ | 自动版本切换，绑定项目 |
| **n** | 快 | ❌ | ⭐⭐ | 轻量，仅 Linux/macOS |

**FNM 优势**:
- 启动速度 20-40 倍于 NVM
- 内存占用减少 90%
- 原生支持 Apple Silicon M1/M2
- 统一的跨平台安装体验

### 2026 年多代理 AI 框架对比 (2026-02-20)

**行业背景**：
- 2025 年是单代理时代，2026 年是"编排代理军团"的时代
- 67% 大企业已在生产环境运行 AI Agent
- 市场规模：$7.55B (2025) → $10.86B (2026) → $199B (2034)
- ⚠️ **警告**：40% 项目会被取消（成本超支/风险控制不足），95% AI 试点无法规模化
- **根本原因不是技术，而是前 90 天的架构选择**

**单代理的致命问题**：
1. 上下文窗口耗尽 — 每个子任务都加到 prompt 里，很快撞 token 限制
2. 推理混乱 — LLM 不断在不同认知模式间切换
3. 无并行性 — 可以并行的任务被迫串行
4. 调试噩梦 — 2000 行 prompt 里找 bug

**多代理解决方案的优势**：
- 专业化提示：每个 agent 有聚焦优化的 prompt
- 并行执行：独立 agent 可并发
- 故障隔离：一个 agent 挂了不会连锁崩溃
- 模块化测试：可独立测试和改进每个 agent

**三大框架对比**：

| 框架 | 开发者 | 哲学 | 适合场景 |
|------|--------|------|---------|
| **LangGraph** | LangChain | 图形化状态机，显式控制流 | 需要审计性和可预测性的生产系统 |
| **CrewAI** | 社区 | 基于角色的团队协作 | 快速原型，团队协作模拟 |
| **AutoGen** | Microsoft | 事件驱动异步编排 | 复杂对话系统，研究实验 |

**LangGraph 核心概念**：
- 节点（Nodes）= 函数（agent/tool/逻辑）
- 边（Edges）= 控制流
- 状态（State）= 显式传递的 TypedDict

**LangGraph 杀手功能**：
1. **可视化调试** — `graph.get_graph().draw_mermaid_png()` 生成流程图
2. **状态持久化** — Checkpointing 支持暂停/恢复工作流
3. **Human-in-the-loop** — `interrupt()` 插入人类审批检查点

**选择 LangGraph 的信号**：
- 需要完全控制每一步的执行
- 生产系统需要审计日志
- 复杂条件分支和状态管理

**真实案例警示**：
> 2025年7月，一家财富500强保险公司的 AI Agent 进入死循环。4小时内向遗留承保系统发送 847,000 次 API 调用，产生 $63,000 云账单并触发生产中断。根本原因不是代码错误 — 而是**架构问题**：无状态检查点、无熔断器、无干预机制。

*最后更新: 2026-02-20*
