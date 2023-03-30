# BrowserPet
A browser pet made by javascript

I've always wanted to made a pet in my browser, so I'm doing so!

## 当前思路：

- 通过requireAnimationFrame更新状态（图像，位置）。需要记录开始时间，计算图像的序号，计算位置等。
- 记录所有可行动画，记录每帧图像的源。

- 保留一个接口改变其运动状态：

  - 移动，方向60度，速度为20
  - 静止
  - 沿着某条路径运动

  然后根据需要的运动挑选需要的姿势。 

- 还有一个特殊用法：右键宠物使其处于listen状态，然后左键屏幕某一位置，宠物会到达此位置。

## 其他考虑

- 增加静止的动作
- 增加原地（或附近）移动跳跃动作
- 考虑为跳跃增加纵向位移来模拟跳跃

另外，感谢[terraria wiki](https://terraria.wiki.gg/zh/wiki/皇家美味)提供资源，感谢相关在线网站提供的图像编辑功能。
