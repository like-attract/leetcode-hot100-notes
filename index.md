---
layout: default
title: LeetCode Hot100 错题本
---

# LeetCode Hot100 错题本

记录我刷 Hot100 时做错、想复杂、没想到关键思路的题。先把所有错题放在这一个 Markdown 文件里，方便坚持更新；等内容多了以后，再拆成数组、链表、动态规划等专题。

## 目录

- [15. 三数之和](#15-三数之和)

---

## 15. 三数之和

### 题目

输入整数数组，判断是否存在三元组，要求：下标不同，三数之和为0，不重复。
#15 #数组 #双指针 #嵌套列表

> 输入：nums = [-1,0,1,2,-1,-4]
> 输出：[[-1,-1,2],[-1,0,1]]

### 思路

最优先的想法肯定是暴力枚举，不过==嵌套列表去重==也是个问题，不能用常规的列表去重方式：

- 集合去重：`new_lst = list(set(lst))`
- 字典函数：`new_lst = list(dict.fromkeys(lst))`
- 推导式：`new_lst = []; [new_lst.append(x) for x in lst if x not in new_lst]`

需要使用元组，本题还需要用sorted对数组进行排序，不然[1,0,1]和[0,1,1]都会保留

`temp = list({tuple(i) for i in lst}); res = [list(i) for i in temp]`

```python
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        ans=[]
        n = len(nums)
        for i in range(n):
            a = nums[i]
            for j in range(i+1,n):
                b = nums[j]
                for k in range(j+1,n):
                    if nums[k]==-a-b:
                        ans.append([a,b,nums[k]])
        ans2 = list({tuple(sorted(i)) for i in ans})
        ans3 = [list(i) for i in ans2]
        return ans3
```

三层暴力循环，时间复杂度为$O(n^3)$肯定是不行的。当然第三个for循环可以写简单点：

```python
# ...
            for j in range(i+1,n):
                b = nums[j]
                if -b-a in nums[j+1:]: # 只是代码变简单了，实质还是O(n)查找
                    ans.append([a,b,-a-b])
```

想到之前学过==set()来降低复杂度==，可以尝试一下

- 注意，**`in set()` 的查找是 O(1)，但构建 set 的过程是 O(n)**，所以不能直接在数组外面加一个set，而是**内层循环外预先建好 set**，避免重复构建，有点类似#187 重复的DNA序列

```python
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort() # 注2：排序后去重，提高速度
        ans = set()
        n = len(nums)
        # 注1：特殊值[0]*3000处理
        if list(set(nums))==[0] and nums.count(0)>=3: return [[0,0,0]]
        
        for i in range(n):
            if nums[i]>0: break # 注2
            if i > 0 and nums[i] == nums[i-1]: continue # 注2
            a = nums[i]
            seen = set()          # 只建一次 O(n) 的 set
            for j in range(i+1, n):
                b = nums[j]
                c = -a - b
                if c in seen:     # O(1) 查找，无需切片
                    ans.add(tuple(sorted([a, b, c])))
                seen.add(b)  
        return [list(x) for x in ans]
```

此时复杂度降到$O(n^2)$但是本题比较过分，（去掉备注的代码）最终在第315/316个案例上超时了（`[0]*3000`），我说为什么有些人的解法单独对0做优化，原来在这，可以通过特殊案例编程来解决（……虽然这样不太好）

注1：` if list(set(nums))==[0] and nums.count(0)>=3: return [[0,0,0]]`

现在就可以跑出来了，用时超过了5%的人……

本题的主角其实是——**双指针**（#283 移动零）

> 犹豫不决先排序，步步逼近双指针

1. 先排序，时间复杂度$O(nlog n)$，空间$O(log n)$
2. 固定最小指针i，考虑双指针left和right交替向中间移动，时间复杂度$O(n^2)$

```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        nums.sort()  # 关键，注意元素是从小到大排列
        n = len(nums)
        ans = []

        for i in range(n):
            if nums[i]>0: break # 由于排序，最小值不能大于0
            # 跳过重复的 i，因为nums[i-1]的结果已经考虑过
            if i > 0 and nums[i] == nums[i-1]: continue                
            # 双指针：left 在 i+1，right 在末尾
            left, right = i + 1, n - 1
            while left < right:
                total = nums[i] + nums[left] + nums[right]
                if total == 0:
                    ans.append([nums[i], nums[left], nums[right]])
                    # 跳过重复值
                    while left < right and nums[left] == nums[left+1]:
                        left += 1
                    while left < right and nums[right] == nums[right-1]:
                        right -= 1
                    left += 1
                    right -= 1
                elif total < 0:
                    left += 1 # 总和小于0，需要元素变大，左指针+1
                else:
                    right -= 1  # 总和大了，需要元素变小，右指针-1       
        return ans
```

### 复盘

| 方法             | 时间复杂度 | 空间 | n=3000 实测 |
| ---------------- | ---------- | ---- | ----------- |
| 原代码 `in list` | O(n³)      | O(1) | ~30s        |
| 预建 set         | O(n²)      | O(n) | 683ms*      |
| 排序+双指针      | O(n²)      | O(1) | 563ms       |
| Counter频次法    | O(k²)      | O(k) | 543ms       |

其实双指针的时间复杂度也是$O(n^2)$，不过这里有几点值得学习的地方，在正式双指针之前，==根据题目特点，有两个去重的语句，也可以缩短一点运行时间==：

- `if nums[i]>0: break`
- `if i > 0 and nums[i] == nums[i-1]: continue`  

注2：后续在预设set方法里加入nums排序和上面两句，运行时间从1593ms→1363ms→683ms

此外，也可能会出现漏掉全是0的情况，可以在输出前加一句判断：` if nums.count(0)>=3 and [0,0,0] not in res: res.append([0,0,0])`

如果数组存在多个0，那[0,0,0]肯定满足，再判断一下是否已经有了，没有就加进去就好了。

最后，延生一个方法：==频次统计 + 分类讨论（O(n + k²)，k 是不同数字个数）==

如果数组中重复数字多，可：

1. 统计每个数的频次 `cnt[x]`
2. 枚举所有不同的数 `x, y`，计算 `z = -x-y`
3. 根据频次判断是否可行：
   - 若 `x == y == z`：需 `cnt[x] >= 3`
   - 若 `x == y != z`：需 `cnt[x] >= 2` 且 `cnt[z] >= 1`
   - 若 `x < y < z`：需 `cnt[x], cnt[y], cnt[z] >= 1`

```python
# Counter频次法
class Solution:
    def threeSum(self, nums):
        from collections import Counter
        cnt = Counter(nums)
        keys = sorted(cnt.keys())
        res = []
        for i, x in enumerate(keys):
            for j in range(i, len(keys)):
                y = keys[j]
                z = -x - y
                if z < y: continue
                if z not in cnt: continue
                # 频次检查
                need = {x:1, y:1, z:1}
                if x == y: need[x] += 1
                if y == z: need[y] += 1
                if x == z: need[x] += 1
                if all(cnt[k] >= need[k] for k in need):
                    res.append([x,y,z])
        if nums.count(0)>=3 and [0,0,0] not in res:
            res.append([0,0,0])
        return res
```