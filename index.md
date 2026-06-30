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
> 
> 输出：[[-1,-1,2],[-1,0,1]]

### 思路

最优先的想法肯定是暴力枚举，不过==嵌套列表去重==也是个问题，不能用常规的列表去重方式：

- 集合去重：`new_lst = list(set(lst))`
- 字典函数：`new_lst = list(dict.fromkeys(lst))`
- 推导式：`new_lst = []; [new_lst.append(x) for x in lst if x not in new_lst]`

嵌套列表需要将内部列表转换为元组（因为列表不可哈希，元组可哈希），利用集合去重，最后转回列表

`tmp = set(tuple(i) for i in lst); res = [list(i) for i in tmp]`

`tmp = {tuple(i) for i in lst}; res = [list(i) for i in tmp]`

**解释：** 

1. **原理**：存入 set 的元素必须是 **可哈希（hashable）** 类型：
   ✅ 可哈希：int、str、tuple、float 等不可变类型
   ❌ 不可哈希：list、dict、set 等可变容器（里面内容可以随时修改，Python 无法稳定算出它的哈希值）
2. `tuple(i) for i in lst`
   遍历外层列表里每一个内层小列表，把 [1,2] → (1,2)、[3,4] → (3,4)
   `set(...)`
   集合自动剔除重复元组，tmp = {(1,2), (3,4)}
   `[list(i) for i in tmp]`
   遍历去重后的元组集合，把元组转回列表，最终结果：
   `res = [[1,2], [3,4]]`
3. 写法2`{表达式 for 变量 in 可迭代对象}` 就是**集合推导式**，等价于 `set(生成器)`，写法更精简，运行逻辑、结果一模一样。
4. 本题还需要用sorted对数组进行排序，即`sorted(tuple(i))`，不然[1,0,1]和[0,1,1]都会保留

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

### 双指针

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
                    # 注：跳过重复值（如果不在这步去重的话就得返回答案前用前面的列表元组列表推导式去重）
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

注：

```python
# ...这里不需要sorted，因为已经是i<l<r + nums排序后了
ans.append(tuple(nums[i],nums[l],nums[r])) 
# ...
tmp = {c for c in ans}
res = [list(i) for i in tmp]
return res
```

### 复盘

| 方法             | 时间复杂度 | 空间 | n=3000 实测 |
| ---------------- | ---------- | ---- | ----------- |
| 原代码 `in list` | O(n³)      | O(1) | ~30s        |
| 预建 set         | O(n²)      | O(n) | 683 ms*     |
| 排序+双指针      | O(n²)      | O(1) | 563 ms      |
| Counter频次法    | O(k²)      | O(k) | 543 ms      |

其实双指针的时间复杂度也是$O(n^2)$，不过这里有几点值得学习的地方，在正式双指针之前，==根据题目特点，有两个去重的语句，也可以缩短一点运行时间==：

- `if nums[i]>0: break`
- `if i > 0 and nums[i] == nums[i-1]: continue`  

注2：后续在预设set方法里加入nums排序和上面两句，运行时间从1593 ms→1363 ms→683 ms



最后，延生一个方法：==频次统计 + 分类讨论（O(n + k²)，k 是不同数字个数）==

1. 先用 `Counter` 统计每个数字出现次数，去重拿到有序不重复数字列表 `keys`
2. 两层循环枚举两个数 `x、y`，算出需要的第三个数 `z = -x-y`
3. 约束 `z >= y` 保证 `x≤y≤z`，天然避免重复三元组
4. 判断原数组频次`cnt`是否足够凑出这三个数`need`，满足则加入结果

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
                need = {}
                for num in (x, y, z):
                    need[num] = need.get(num, 0) + 1
                if all(cnt[k] >= need[k] for k in need):
                    res.append([x,y,z])
        return res
```



## [438. 找到字符串中所有字母异位词](https://leetcode.cn/problems/find-all-anagrams-in-a-string/)

### 题目

给定两个字符串s和p，找到s中所有和p是异位词的子串，返回这些子串的起始索引。#438 #子串 #异位词 #滑动窗口 #子序列

> 输入：s = "cbaebabacd", p = "abc"
>
> 输出：[0,6]

### 思路

字母异位词这题之前做过，更准确点说，是面试中被手撕过，#49 字母异位词分组 #动态规划

```python
def word_break(s: str, word_dict: list[str]) -> bool:
    word_set = set(word_dict)  # 转为集合，查找 O(1)
    n = len(s)
    
    # dp[i] 表示 s[0:i] 能否用字典中的单词拼成
    dp = [False] * (n + 1)
    dp[0] = True  # 空字符串可以被"拼成"
    
    for i in range(1, n + 1):
        for word in word_set:
            word_len = len(word)
            # 检查：前 i-len(word) 个字符能否拼成 + 剩余部分是否等于 word
            if i >= word_len and dp[i - word_len] and s[i - word_len:i] == word:
                dp[i] = True
                break  # 找到一种拼法即可
    
    return dp[n]
```

做# 438的过程有点不顺利，因为我想起# 49使用了集合set、动态规划，结果让自己越写越迷茫，有种技多压身，因为不精反而寸步难行。

复盘一下# 49的做法：首先对词典`word_set`进行集合化，这一步其实不是必须，只是锦上添花；然后是常规的动态规划三要素：定义状态、初始化、状态转移。

回到这题，如果没有什么好的思路的话，其实可以先暴力手撕，再去考虑如何优化时间复杂度。要知道一件事情，先做出来，才能考虑优化，要知道哪个是主干，哪个是开枝散叶：

```python
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        n1 = len(s)
        pp = sorted(p)
        n2 = len(pp)
        ans = []

        for i in range(n1-n2+1):
            tmp = s[i:i+n2] # a
            if sorted(tmp)==pp: # b
                ans.append(i)
        return ans
```

想法就是：==依次遍历s的子串==（复杂度$n$），==和p进行匹配==（sorted复杂度$k log k$）

当时想用集合，因为集合查找是$O(1)$，但是集合也有问题：1) 集合无序：也就是说遍历 / 打印顺序不确定；2) 集合不能按下标访问，没有切片操作，所以# a的for循环与切片操作就失效了。

既然集合走不通，就想着另外一条路，降低匹配的复杂度，匹配的核心目的是看切片的子串和所需的p是否字母完全相同，sorted很直观，排序后比较是否相等，但其实有个更直观的，字母的出现次数是否完全相同。

```python
def is_anagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    cnt = [0] * 26 # 26个小写字母，故设置26个位置
    for c in s:
        cnt[ord(c)-ord('a')] += 1 # 使用ord函数将字符转化成Unicode编码
    for c in t:
        cnt[ord(c)-ord('a')] -= 1
    return all(x == 0 for x in cnt)

from collections import Counter
def is_anagram(s, t):
    return Counter(s) == Counter(t)
```

这里的诀窍就是使用ord函数，再用每个字符与起始字符'a'作差，得到各自对应的下标，这样就方便统计出现次数了，虽然这里做了两遍for循环，但别忘了复杂度只看大头，所以复杂度仍是$O(k)$。也有一个简便的方式，即我们在# 15的衍生里提到的Counter函数，它可以专门统计字符串中字母出现的次数：

`c = Counter('abracadabra') # Counter({'a': 5, 'b': 2, 'r': 2, 'c': 1, 'd': 1})`

理论上直接替换# b可以降低复杂度，但是本题又来作妖，给了`s=['a']*20001;p=['a']*10000`，所以现在的复杂度$O(n*K)$也很大了。

### 滑动窗口

所以，该怎么办呢？其实我们最开始的思路没错，优化的思路偏了，的确是使用字母的出现次数工具，但是这次是降低遍历的复杂度，或者说**减少嵌套循环**。其实也就是我们的主角——**滑动窗口**。

1. 先统计 p 的字母频次数组 count_p 
2. 统计 s 前 k 个字符频次 count_win，对比两个数组是否相等 
3. 窗口向右滑动：出窗字符计数 - 1，进窗字符计数 + 1，不用重新统计整个窗口，每次仅两次修改，O(1) 更新

```python
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        n, k = len(s), len(p)
        if n<k: return [] # 加一步总是好的，小心题目恶心人
        count_p = [0] * 26 # 初始26个字母
        count_win = [0] * 26
        res = []
     
        # 初始化第一个窗口  0,1,..,k-1
        for i in range(k):
            count_p[ord(p[i]) - ord('a')] += 1
            count_win[ord(s[i]) - ord('a')] += 1
        if count_win == count_p:
            res.append(0)
        
        # 滑动窗口遍历剩余位置  k,k+1,...,n-1
        for right in range(k, n):
            # 移除左边滑出的字符 0,1,...,n-k-1
            left_char = s[right - k]
            count_win[ord(left_char) - ord('a')] -= 1
            # 添加右边新进的字符 k,k+1,...,n-1
            new_char = s[right]
            count_win[ord(new_char) - ord('a')] += 1
            # 对比频次数组 1,2,...,n-k
            if count_win == count_p:
                res.append(right - k + 1)
        return res
```

显而易见，此时只是多个for循环，复杂度为$O(n+k)\rightarrow O(n)$

但其实可以再简便一点，使用我们的Counter函数：

```python
from collections import Counter
class Solution:
    def findAnagrams(self, s: str, p: str) -> List[int]:
        d, k = Counter(p), len(p)
        l = 0
        res = []
        for i, j in enumerate(s):
            d[j] -= 1
            while l <= i and d[j] < 0:
                d[s[l]] += 1
                l += 1
            if i-l+1 == k:
                res.append(l)
        return res
```

- `Counter(p)`：统计模式串 `p` 每个字母出现次数，字典 `d` 初始是**需要凑齐的字符配额**
- `k`：模式串 `p` 的长度，我们要找的窗口固定长度就是 `k`
- `l = 0`：滑动窗口**左边界**，`i` 是循环变量充当**右边界**
- 用字典 `d` 记录 `p` 每个字符**还缺多少个**
- 右指针 `i` 逐个向右遍历字符 `j=s[i]`：
  - 消耗一个配额：`d[j] -= 1`
  - 如果该字符配额变负数 = 当前窗口里这个字符**多出来了**，必须移动左边界收缩窗口，把多余字符剔除
- 收缩完窗口后，如果当前窗口长度刚好等于 `k`，说明窗口内字符刚好和 `p` 频次完全匹配（异位词），把左边界 `l` 存入结果

## 76. 最小覆盖子串

### 题目

给定两个字符串s和t，返回s中长度最小的覆盖t中所有字符（包括重复字符）的子串，若没有则返回空字符串""。#76 #滑动窗口 #Counter #子串 #子序列

> 输入：s = "ADOBECODEBANC", t = "ABC"
> 输出："BANC"

### 思路

1. Counter记录目标字符t的字母数量，记为need
2. 对于滑动窗口window，右指针不断遍历s
   1. 对于每个s的字符c，如果c属于need，填进window
   2. 当window[c]等于need[c]，valid+=1，其中valid是当前窗口满足数量的字符个数
   3. 当valid和need中字母数量相等时，说明窗口已足够覆盖字符t
3. 现在考虑窗口能否缩小，让左指针收缩
   1. 观察窗口左边界d=s[left]
   2. 如果d在need里，再看window[d]是否和need[d]相等，如果相等说明取出d之后，d所代表的字符不再满足，valid-=1；另外因为取出了d，所以window[d]-=1
   3. 左指针右移，此时d才被取出

```python
from collections import Counter
class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if len(s)<len(t): 
            return "" #虽然判断很简单，但是的确可以优化速度
        need, window = Counter(t), Counter()
        left = start = valid = 0
        min_len = len(s)+1 # float('inf')一个绝对大的值，方便后续更新
        
        for right,c in enumerate(s):
            if c in need:
                window[c]+=1 #Counter的好处是不会因空值报错
                if window[c]==need[c]: valid+=1
            while valid==len(need): #左指针准备收缩
                curr_len = right-left+1
                if curr_len<min_len:
                    min_len=curr_len #记录最小子串长度
                    start=left #记录最小子串起始位
                d=s[left]
                if d in need:
                    if window[d]==need[d]: valid-=1
                    window[d]-=1
                left+=1 #左指针移动
        return "" if min_len==len(s)+1 else s[start:start+min_len]
```



## 栈相关

**栈是一种后进先出（LIFO, Last In First Out）** 的线性数据结构：

- 只能在**一端（栈顶）** 插入、删除元素
- 入栈（push）：往栈顶添加元素
- 出栈（pop）：取出栈顶元素
- 栈底：另一端封闭，不能直接操作

形象举例：叠盘子，最后放上去的盘子（栈顶）最先拿走。

- 栈不支持随机访问，不能直接取中间元素
- 不要用 `pop(0)` 做栈顶弹出，时间复杂度 O(n)，效率极低
- 出栈pop, 栈顶peek一定要保证栈非空！

**Python 四种实现栈的方式**

### 方式1：用列表 `list` 最简单（常用）

列表尾部当作**栈顶**，`append` 入栈、`pop()` 出栈效率最高（O(1)）
```python
# 初始化栈
stack = []

# 1. 入栈 push
stack.append(10)
stack.append(20)
stack.append(30)
print(stack)  # [10, 20, 30]

# 2. 出栈 pop
top = stack.pop()
print(top)     # 30
print(stack)   # [10, 20]

# 3. 查看栈顶 peek
if stack: #保证非空
    print(stack[-1])  # 20

# 4. 判断是否为空
print(len(stack) == 0)  # False

# 5. 栈长度
print(len(stack))  # 2
```
### 方式2：封装成栈类（面向对象，规范）（题# 155最小栈）

```python
class MinStack:
    def __init__(self):
        self.stack = []
        self.min_stack = []  # 单调非增栈（栈顶是最小值）

    def push(self, value: int) -> None:
        self.stack.append(value)
        if not self.min_stack or value <= self.min_stack[-1]:  # 注意是 <=！处理重复最小值
            self.min_stack.append(value)

    def pop(self) -> None:
        if not self.stack:
            return
        val = self.stack.pop()
        if val == self.min_stack[-1]:
            self.min_stack.pop()

    def top(self) -> int:
        return self.stack[-1] if self.stack else []

    def getMin(self) -> int:
        return self.min_stack[-1] if self.min_stack else []
```

> 1. `stack`: 主栈，存所有元素。
> 2. `min_stack`: 辅助栈，**只在 push 的值 ≤ 当前 min 时压入**；pop 时若弹出值 == min_stack[-1]，则 min_stack 也 pop。
> 3. 所有操作均为 **O(1)** 时间，空间 O(n) 最坏。
> 4. **避免 `insert(0, ...)` 和 `pop(0)`**：
>    - Python list 的首部操作是 O(n)，应全部改用尾部操作（`.append()`, `.pop()`）。

### 栈常见应用场景

1. **括号匹配校验**（题# 20有效括号）

   ```python
   def check_bracket(s):
       stack = []
       match = {')':'(', ']':'[', '}':'{'}
       for c in s:
           if c in match.values(): # .value()可以匹配字典的值
               stack.append(c)
           elif c in match: # 字典匹配的是key
               if not stack or stack.pop() != match[c]:
                   return False
       return len(stack) == 0
   
   print(check_bracket("{[()]}"))  # True
   print(check_bracket("{[(])}"))  # False
   ```
2. 题#394 字符串解码

```python
# 输入：s = "3[a2[c]]"  输出："accaccacc"
class Solution:
    def decodeString(self, s: str) -> str:
        stack, times = [],[]
        i,n = 0,len(s)
        
        while i<n:
            c = s[i]
            if c == '[':
                b = []
                while stack and stack[-1].isdigit():
                    b.append(stack.pop())
                times.append(int(''.join(b[::-1])) if b else 1) #本题倍数1无意义
                stack.append(c)
            elif c == ']':
                a = []
                while stack and stack[-1] != '[':
                    a.append(stack.pop()) #弹出所有的字符
                stack.pop() #弹出'['
                time = times.pop()
                aa = ''.join(a[::-1])*time #记得反转
                stack.append(aa)
            else:
                stack.append(c)
            i+=1
        return ''.join(stack)


class Solution:
    def decodeString(self, s: str) -> str:
        stack = []
        for c in s:
            if c == ']':
                # 弹出字符直到 '['
                chars = []
                while stack and stack[-1] != '[':
                    chars.append(stack.pop())
                stack.pop()  # pop '['
                # 弹出数字
                num_str = []
                while stack and stack[-1].isdigit():
                    num_str.append(stack.pop())
                repeat = int(''.join(num_str[::-1])) if num_str else 1
                # 拼接并压回
                decoded = ''.join(chars[::-1]) * repeat
                stack.append(decoded)
            else:
                stack.append(c)
        return ''.join(stack)
```

3. 题#239 滑动窗口最大值（双端队列deque）

```python
from collections import deque
class Solution:
    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:
        n = len(nums)
        if n==k:
            return [max(nums)]
        dq = deque() # 单调减，nums下标
        ans = []

        for i in range(n):
            c = nums[i]
            # 同上题，新的值更大的话说明不单调了，先剔除，给新的让位
            while dq and nums[dq[-1]]<=c:
                dq.pop()
            dq.append(i)
            # 当i=k时，开始移除最左侧的
            if dq[0]==i-k:
                dq.popleft()
            # 当i=k-1时，长度为k的窗口形成
            if i>=k-1:
                ans.append(nums[dq[0]])
        return ans
```

## 单调栈

### 739. 每日温度

```python
# 返回每一天还有几天温度更高（严格高），没有返回0
# 输入: temperatures = [73,74,75,71,69,72,76,73] 输出: [1,1,4,2,1,1,0,0]
class Solution:
    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:
        n = len(temperatures)
        ans = [0] * n
        st = []  # 记录下标，单调递减
        for i, t in enumerate(temperatures):
            # 当新温度大于栈内，说明不单调了，剔除
            while st and t > temperatures[st[-1]]:
                j = st.pop()
                # 被剔除说明找到了比他大的，下标相减即是所求
                ans[j] = i - j
            st.append(i) # 入栈
        return ans
```

### 42. 接雨水

```python
# 给定n个非负整数表示每个宽度为1的柱子的高度，计算按此排列的柱子，下雨之后能接多少雨水。
# 即这些柱子围成的坑的面积，需结合图形理解
class Solution:
    def trap(self, height: List[int]) -> int:
        stack = [] #单调栈，记录下标
        ans = 0

        for i,h in enumerate(height):
            while stack and h > height[stack[-1]]: #发现更高的高度
                a = stack.pop() #弹出，计算a处的水
                if not stack: #说明到顶了
                    break
                width = i-stack[-1]-1 #i-右侧最大，stack[-1]-左侧最大
                depth = min(h,height[stack[-1]])-height[a]
                ans+=width*depth #相当于横向算面积
            stack.append(i)
        return ans
```

### 84. 柱状图中的最大矩形

给定 *n* 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1 。求在该柱状图中，能够勾勒出来的矩形的最大面积。

```python
class Solution:
    def largestRectangleArea(self, heights: List[int]) -> int:
        st = []
        max_area = 0
        # 末尾补零，遍历结束自动把栈内剩余元素全部弹出计算
        heights.append(0)

        for i,h in enumerate(heights):
            while st and h < heights[st[-1]]:
                mid = st.pop()
                if st:
                    width = i-st[-1]-1
                else:
                    width = i
                area = heights[mid]*width
                max_area = max(max_area,area)
            st.append(i)
        heights.pop()
        return max_area
```

### 85. 最大矩形

给定一个仅包含 `0` 和 `1` 、大小为 `rows x cols` 的二维二进制矩阵，找出只包含 `1` 的最大矩形，并返回其面积。

本质是逐行将 2D 矩阵转为逐行的 1D 直方图，复用 84 题的单调栈解法。

步骤拆解

- 维护一个 height 数组，长度为列数 n。
- 遍历每一行，更新 height[j]：
  - 若 matrix[i][j] == "1"，则 height[j] += 1
  - 否则 height[j] = 0（被"0"打断，重新计数）
- 当前行的 height 数组，跑一遍 84 题的单调递增栈，求出当前直方图的最大矩形面积。
- 全局保留最大值。

```python
class Solution:
    def maximalRectangle(self, matrix: List[List[str]]) -> int:
        heights = []
        max_area = 0
        for c in matrix: #添加末尾0哨兵             
            c.append("0")
        
        for c in matrix:
            c = [int(t) for t in c]
            if heights==[]:
                heights=c
            else:
                for i in range(len(heights)):
                    heights[i]=0 if c[i]==0 else heights[i]+c[i]
            st=[] # 每行重新进行#84的单调栈，st得清空
            for i,h in enumerate(heights):
                while st and h<heights[st[-1]]:
                    mid = st.pop()
                    # 宽度永远是左右边界
                    width = i-st[-1]-1 if st else i
                    area = width*heights[mid]
                    max_area = max(area,max_area)
                st.append(i)
        for c in matrix: #还原矩阵
            c.pop()
        return max_area
```

当然，这里**原地修改原矩阵 `c.append("0") / c.pop()`**

在极端场景会导致数组长度异常，更好做法是用临时数组拼接哨兵，不动原`matrix`，而且某包觉得改原数组不优雅。

```python
# ...删除首尾两个for循环
tmp = heights + [0] #临时加哨兵0
st=[]
for i,h in enumerate(tmp):
# ...后续不变
```

### 复盘

1. **单调递增栈作用：**

栈里存下标，保证栈内对应柱子高度**从小到大递增**

一旦遇到更小柱子，说明栈顶柱子找到了**右边界**，弹出栈顶，计算这个柱子能构成的最大矩形面积。

2. **技巧：数组末尾补一个 0**

在 `heights.append(0)`，强制把栈里剩余所有元素全部弹出计算，不用额外处理遍历收尾逻辑，写代码最简单。

3. **宽度通用公式（重点）**

弹出栈顶下标 `mid`

- 右边界：当前遍历下标 `i`
- 左边界：弹出后新的栈顶 `st[-1]`（栈为空则左边界 =-1）

$width = i - st[-1] - 1 \quad area = heights[mid] \times width$

0. 总结

单调栈这个工具的逻辑很简单，代码就是先建立一个空的列表，存储数组下标，通过for循环遍历，while循环保证单调，#42是单调递减的栈，#84是单调递增的栈，当发现不单调了，就说明可以停下来处理栈内的数据了。

实际上，这些方法的操作都很简单，双指针是`left, right=0, len(n)-1`，先把左右指针放在最左和最右，然后通过`while left<right:`开始循环，然后条件判断收缩左右指针--左加右减。

这个“条件判断”其实比起方法来更重要，每道题都是要具体问题具体分析。接雨水里计算坑里的水，最大矩形里计算能围成的矩形面积，得从中得到一个共性的计算公式，而且还得习惯于在单调栈、双指针这样的框架里去分析。

此外，本题#84这个数组末尾补一个0，是一个很妙的技巧，相当于强行增加一个休止符；同样，在#76覆盖子串也有一个异曲同工之妙的技巧——`min_len`的初始值设置一个很大的值（正常循环无法得到的），方便循环启动。

## 560. 和为K的子数组

### 前缀和

数组 `nums[0..i]` 所有元素的和，记作 `prefix[i]`。----数列前i项和$S_i$

```
prefix[i] = nums[0] + nums[1] + ... + nums[i]
```

**有什么用？** 快速求**任意子数组和** `nums[l..r]` ：$S_r-S_{l-r}$ 

```
sum(nums[l..r]) = prefix[r] - prefix[l-1]
```

一次 O(n) 预处理前缀和数组，之后每次子数组求和 O(1)。

### 题目

给你一个整数数组 `nums` 和一个整数 `k` ，请你统计并返回该数组中和为 `k` 的子数组的个数。#560 #子数组 #哈希表 #前缀和 #子序列

本题官解是：**与哈希表结合 — 解决「和为 K 的子数组」**

思考：

遍历到位置 i 时，有多少个子数组和为k → 利用前缀和之差的思想，有多少个之前的 j 满足 `prefix[i] - prefix[j] = k`。

→ 利用等号，即**有多少个之前的 `prefix[j] = prefix[i] - k`。**

所以用哈希表记录每个前缀和`prefix[j]`出现的次数，边遍历边查。

---

### 思路：前缀和+哈希表

```python
class Solution:
    def subarraySum(self, nums: List[int], k: int) -> int:
        prefix = {0: 1} #哈希表，记录前缀和出现次数，初始：和0-1次
        cur = ans = 0
        for n in nums:
            cur += n #前缀和
            ans += prefix.get(cur - k, 0) #看哈希表里有没有和k互补的记录，有几次就加几次
            prefix[cur] = prefix.get(cur, 0) + 1 #把现在的前缀和加进哈希表，增加1次
        return ans
```

```
nums = [3, 4, 7, 2, -3, 1, 4, 2], k = 7
```

| i    | nums[i] | cur (prefix) | cur - 7 | 匹配?                            | 更新哈希                |
| ---- | ------- | ------------ | ------- | -------------------------------- | ----------------------- |
| 0    | 3       | 3            | -4      | ✗                                | `{0:1, 3:1}`            |
| 1    | 4       | 7            | 0       | ✓ (前缀和0出现1次)               | `{0:1, 3:1, 7:1}`       |
| 2    | 7       | 14           | 7       | ✓ (i=1的7)                       | `{0:1, 3:1, 7:1, 14:1}` |
| 3    | 2       | 16           | 9       | ✗                                | `{..., 16:1}`           |
| 4    | -3      | 13           | 6       | ✗                                | `{..., 13:1}`           |
| 5    | 1       | 14           | 7       | ✓ (i=1的7和...实际上14出现第2次) | `14:2`                  |
| 6    | 4       | 18           | 11      | ✗                                | `18:1`                  |
| 7    | 2       | 20           | 13      | ✓ (i=4的13)                      | `20:1`                  |

匹配到的子数组：`[7]`、`[3,4]`、`[7,2,-3,1]`、`[2,-3,1,4,2]` 共 4 个。

- 为什么初始 `{0: 1}`？

因为当 `cur == k` 时，子数组从开头到当前位置的和正好为 k，此时 `cur - k = 0`，需要能找到「前缀和为 0 出现过一次」，这对应空数组的虚拟前缀和。

没有 `{0:1}`，`[3,4]` 这个子数组就会漏掉。

---

### 模板总结

```
问题特征                                  →  解法
──────────────────────────────────────────────────────────────
固定k，求子数组个数                      →  前缀和 + 哈希表
求子数组和的最值（无负数）               →  前缀和 + 单调/双指针
求子数组和的最值（有负数）               →  前缀和 + 线段树/归并
二维矩阵求子矩阵和                       →  二维前缀和
子数组和能被k整除                        →  前缀和模k + 哈希表
```

## 42. 接雨水

给定一个数组 `height`，代表一排柱子高度，柱子宽度都是 1，下雨后，**两个高柱子中间低洼的地方能接住多少水**，求总接水量。

例子：`height = [0,1,0,2,1,0,1,3,2,1,2,1]`

答案：**6**

核心原理：关注某一根位置i能装多少水，看两边柱子的最高

- weight = max(min(左柱子，右柱子) - 当前柱子高, 0)

### 暴力枚举

```python
class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        ans = 0

        for i in range(1,n-1): #两侧装不了水
            left = max(height[:i])
            curr = height[i]
            right = max(height[i+1:])

            ans+=max(0,min(left,right)-curr)        
        return ans
```

很明显，双重循环，$O(n)$遍历，切片max最大值$O(k)$，复杂度很高

优化思路：去掉嵌套循环，预处理左右最大值数组，$O(n)$

```python
class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        if n<=2: return 0
        ans = 0
        left_max = [0]*n #位置i左侧最大值
        right_max = [0]*n #位置i右侧最大值

        left_max[0]=height[0]
        for i in range(1,n):
            left_max[i] = max(left_max[i-1],height[i])
        
        right_max[n-1]=height[n-1]
        for i in range(n-2,-1,-1):
            right_max[i] = max(height[i],right_max[i+1])

        for i in range(1,n-1): #这里range(n)也行，因为构造的时候天然包含了本身
            left = left_max[i]
            curr = height[i]
            right = right_max[i]

            ans+=max(0,min(left,right)-curr)        
        return ans
```

下面从专有方法来思考。

### 双指针

左右指针 `left=0，right=n-1`，维护两个变量 `l_max`（左区间最大值）、`r_max`（右区间最大值）

- 如果 `l_max < r_max`：**左指针位置储水量由左边最大值决定**，处理左指针，左指针右移，哪边小处理哪边

  - 假设左边最高 `l_max` 更小：

    当前 left 位置的短板就是左边高度，右边一定存在更高柱子 `r_max` 兜住水，所以可以直接算出当前位置存水量。

- 反之：右指针位置储水量由右边最大值决定，处理右指针，右指针左移

```python
class Solution:
    def trap(self, height: List[int]) -> int:
        n = len(height)
        if n<=2: return 0
        ans = 0
        left,right = 0,n-1
        l_max = r_max = 0

        while left<right:
            l_max = max(l_max,height[left])
            r_max = max(r_max,height[right])
            if l_max>r_max:
                ans+=r_max-height[right]
                right-=1
            else:
                ans+=l_max-height[left]
                left+=1
        return ans
```

### 单调栈

1. **按「竖条」算（前缀最大值 / 双指针）**：一个格子一个格子竖着算，每个位置单独算高度，累加一个个 1×1 小方格水量
2. **按「横条」算（单调栈）**：**一层一层横着算一整条凹槽的水量**，一段区间整体批量算面积，所以是 `宽度 × 高度(depth)`

单调栈本质：**横向逐层算水的横截面积**，所以公式是 `width * depth` 

```python
class Solution:
    def trap(self, height: List[int]) -> int:
        stack = [] #单调栈，记录下标
        ans = 0

        for i,h in enumerate(height):
            while stack and h > height[stack[-1]]: #发现更高的高度
                a = stack.pop() #弹出，计算a处的水
                if not stack: #说明到顶了
                    break
                width = i-stack[-1]-1 #i-右侧最大，stack[-1]-左侧最大
                depth = min(h,height[stack[-1]])-height[a]
                ans+=width*depth #相当于横向算面积
            stack.append(i)
        return ans
```



