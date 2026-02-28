def quicksort(arr):
    """
    快速排序算法
    
    时间复杂度: 平均 O(n log n), 最坏 O(n²)
    空间复杂度: O(log n) 递归调用栈
    
    Args:
        arr: 待排序的列表
    
    Returns:
        排序后的列表
    """
    # 基础情况: 空列表或只有一个元素的列表已经有序
    if len(arr) <= 1:
        return arr
    
    # 选择第一个元素作为基准值
    pivot = arr[0]
    
    # 分割: 将数组分为三部分
    # 小于基准值的元素
    less = [x for x in arr[1:] if x <= pivot]
    # 大于基准值的元素
    greater = [x for x in arr[1:] if x > pivot]
    
    # 递归排序左右两部分，然后合并
    return quicksort(less) + [pivot] + quicksort(greater)


def quicksort_inplace(arr, low=0, high=None):
    """
    原地快速排序（空间更优）
    
    时间复杂度: 平均 O(n log n), 最坏 O(n²)
    空间复杂度: O(log n) 仅递归调用栈
    
    Args:
        arr: 待排序的列表
        low: 左边界索引
        high: 右边界索引
    
    Returns:
        None (直接修改原列表)
    """
    if high is None:
        high = len(arr) - 1
    
    # 递归终止条件
    if low < high:
        # 获取分割点，使用分割函数
        pivot_index = partition(arr, low, high)
        
        # 递归排序基准值左边的部分
        quicksort_inplace(arr, low, pivot_index - 1)
        
        # 递归排序基准值右边的部分
        quicksort_inplace(arr, pivot_index + 1, high)


def partition(arr, low, high):
    """
    分割函数: 将数组分为两部分，返回基准值的最终位置
    
    Args:
        arr: 列表
        low: 左边界
        high: 右边界
    
    Returns:
        基准值的最终位置
    """
    # 选择最右边的元素作为基准值
    pivot = arr[high]
    
    # i 指向最后一个小于基准值的元素
    i = low - 1
    
    # 遍历从 low 到 high-1 的所有元素
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            # 交换 arr[i] 和 arr[j]
            arr[i], arr[j] = arr[j], arr[i]
    
    # 将基准值放到正确的位置
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    
    return i + 1


# 测试代码
if __name__ == "__main__":
    # 测试简单快速排序
    test_arr1 = [64, 34, 25, 12, 22, 11, 90]
    print("原始数组:", test_arr1)
    print("排序后:", quicksort(test_arr1))
    
    # 测试原地排序
    test_arr2 = [64, 34, 25, 12, 22, 11, 90]
    print("\n原始数组:", test_arr2)
    quicksort_inplace(test_arr2)
    print("原地排序后:", test_arr2)
    
    # 测试边界情况
    print("\n边界情况测试:")
    print("空列表:", quicksort([]))
    print("单元素:", quicksort([5]))
    print("重复元素:", quicksort([3, 1, 4, 1, 5, 9, 2, 6]))
