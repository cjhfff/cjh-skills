def quick_sort(arr):
    """
    快速排序函数
    时间复杂度: 平均 O(n log n), 最坏 O(n²)
    空间复杂度: O(log n) - 递归栈深度
    """
    
    # 递归终止条件：空列表或单元素列表无需排序
    if len(arr) <= 1:
        return arr
    
    # 选择基准元素（这里选择中间元素，减少最坏情况概率）
    pivot = arr[len(arr) // 2]
    
    # 分割数组
    left = [x for x in arr if x < pivot]    # 小于基准的元素
    middle = [x for x in arr if x == pivot] # 等于基准的元素
    right = [x for x in arr if x > pivot]   # 大于基准的元素
    
    # 递归排序左右部分，然后合并
    return quick_sort(left) + middle + quick_sort(right)


# 测试示例
if __name__ == "__main__":
    nums = [64, 34, 25, 12, 22, 11, 90]
    print("原始数组:", nums)
    sorted_nums = quick_sort(nums)
    print("排序后:", sorted_nums)
