from typing import List

def quick_sort(arr: List[int]) -> List[int]:
    """Return a new sorted list (ascending) using quick sort."""
    if len(arr) <= 1:
        return arr[:]
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    mid = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + mid + quick_sort(right)

if __name__ == "__main__":
    data = [5, 2, 9, 1, 5, 6]
    print(quick_sort(data)) # [1, 2, 5, 5, 6, 9]
