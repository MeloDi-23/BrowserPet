# BrowserPet
A browser pet made by javascript

I've always wanted to made a pet in my browser, so I'm doing so!

## 当前思路：

- 通过requireAnimationFrame更新状态（图像，位置）。需要记录开始时间，计算图像的序号，计算位置等。
- 记录所有可行动画，记录每帧图像的源。

- 保留一个接口改变其运动状态：

  - 向右运动，速度为10
  - 静止
  - 沿着某条路径运动

  然后根据需要的运动挑选需要的姿势。
