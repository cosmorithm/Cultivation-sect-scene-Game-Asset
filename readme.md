# 仙侠宗门场景资产库

本仓库为《九霄问道》的云海宗门场景整理独立资产的三视图与效果参考。每项资产按 [资产清单](./资产清单.md) 编号，在根目录有一个独立文件夹。

![云海宗门现行主概念图，登天长阶加陡版](./主概念图-v02-天阶加陡.png)

## 三视图工作提示词

复制下面整段，交给绘图代理或美术协作者。需要限定本批工作时，在末尾加上资产编号，例如 `本批只做 A01、C01、E01`。

```text
你是一名负责仙侠游戏场景的资产概念设计师。请为这个仓库的资产绘制可供 3D 建模参考的三视图。每张图只表现一个资产或清单中定义的一套可复用构件。

一、读取参考
先看根目录的「主概念图-v02-天阶加陡.png」和「资产清单.md」，依据资产编号、原图区域和绘制要点定位目标。现行主概念图用于判断场景布局、材质和可见轮廓；资产目录内的现有稿用于比较。原图看不到的背面、进深和接口要按合理结构补全，并注明属于补设计。

二、绘制与出图
实体资产用同一张 PNG 排列正视、右侧视、俯视图，清楚标注三个视角。三图使用正交投影和同一比例。正视与右侧视的底面、台基、檐口等高度逐项对齐，俯视的宽度对应正视，进深对应右侧视。俯视的前端朝下，右侧视的前端朝左。入口、台阶、柱网、屋脊和拼接点在各视图中一一对应。可从同一个简模或结构草图投影，再上色明轮廓。用干净浅底，保留材质与结构细节；颜色、纹样和形态以概念图为依据。人物或标尺仅用于说明尺度。

三、重点资产
主殿 A01 要有高而宽的分层石台基、宽阔正中台阶、高柱深廊和有进深的殿身。用小比例人物显示体量，并校对已有体量稿各视图的比例。天阶 C01 单独画，从左侧圆台出发，首弯后开始爬升，经短转折平台接持续陡升的上段，再直对主殿。用俯视说明 S 形路线，用侧视说明高差、坡段与平台，标清首尾接口。池面和地纹以俯视为主，补高度或剖面。云雾、光照和动画按清单画层次、方向或关键姿态示意。

四、保存与验收
按指定编号完成本批。未指定编号时，从清单顺序分批处理待绘资产。把新 PNG 保存到对应资产目录，定稿命名为「三视图.png」，效果示意命名为「效果示意.png」。若目录已有同名文件，另存带版本号的文件。逐项核对轮廓、三视图比例、遮挡补设计、接口与原图的对应关系。在资产清单中记录实际完成的文件与仍需校对的项目。每批交付时列出已完成编号和未通过的检查项。
```

## 如何提交 Pull Request

这份指南适用于《九霄问道》场景资产库。下面用 **A06 水亭**演示如何提交一张三视图。贡献其他资产时，换成实际的资产编号、目录和分支名。

### 1. 找到资产并创建分支

从[资产清单](./资产清单.md)找到资产编号和目录，参考[主概念图](./主概念图-v02-天阶加陡.png)和 [本页的三视图规范](#三视图工作提示词)。先看该目录已有的稿件，也可以在 [Pull requests](https://github.com/cosmorithm/Cultivation-sect-scene-Game-Asset/pulls) 搜索同一编号。

在 GitHub 仓库页点 **Fork**，把仓库复制到自己的账号。把下面的 `YOUR_USERNAME` 换成你的 GitHub 用户名，再在终端运行。

```bash
git clone https://github.com/YOUR_USERNAME/Cultivation-sect-scene-Game-Asset.git
cd Cultivation-sect-scene-Game-Asset
git remote add upstream https://github.com/cosmorithm/Cultivation-sect-scene-Game-Asset.git
git fetch upstream
git switch -c asset/a06-water-pavilion upstream/main
```

`origin` 是你自己的 Fork，`upstream` 是原仓库。已有原仓库写权限的协作者可以直接在原仓库的 `main` 最新提交上建工作分支，后面的提交和推送步骤相同。

### 2. 保存和检查文件

- 把 PNG 放到对应的编号目录。例如水亭保存为 `A06_水亭/三视图.png`。已有同名稿时，另存为 `三视图-v02.png` 或下一个可用版本。效果类条目使用 `效果示意.png`。
- 实体的正视、右侧视、俯视放在同一张 PNG 上。提交前核对三图比例、轮廓、屋檐和台基高度，以及入口或拼接点的方向。云雾、光照、水流等条目按清单和 README 的要求提交相应示意。
- 更新 `资产清单.md` 里的对应记录，附图片链接，并注明根据遮挡补画的结构以及还有哪些尺寸或接口待校对。

```bash
git status --short
git add -- "A06_水亭/三视图.png" "资产清单.md"
git diff --cached --stat
git diff --cached --check
git commit -m "Add A06 water pavilion orthographic views"
git push -u origin asset/a06-water-pavilion
```

提交前看一眼暂存文件列表，确认里面只有本次贡献相关的文件。新版稿请把 `git add` 中的名字换成实际文件名。

### 3. 在 GitHub 创建 PR

打开[原仓库](https://github.com/cosmorithm/Cultivation-sect-scene-Game-Asset)的 **Pull requests** 页面，点 **New pull request**。从 Fork 提交时，选择 **compare across forks**，并检查分支设置。

| 选项 | 选择 |
| --- | --- |
| Base repository / base | `cosmorithm/Cultivation-sect-scene-Game-Asset` 的 `main` |
| Head fork / compare | 你自己的 Fork 的 `asset/a06-water-pavilion`。原仓库协作者选择原仓库下的工作分支。 |

在 **Files changed** 预览本次改动，再点 **Create pull request**。若稿件还需要较多复核，可以选择 **Create draft pull request**。

标题可用 `A06 水亭三视图`。正文写清以下三点，并贴一张预览图。若这份 PR 完整解决了某个 Issue，可以另外写 `Closes #编号`。

```markdown
## 变更
- A06 水亭。新增正视、右侧视、俯视 PNG，更新资产清单。

## 核对
- 入口短阶和柱位已对照三个视角核对。
- 根据原图遮挡补画了水下支脚。檐宽仍需复尺。

## 预览
<!-- 将 PNG 拖入 GitHub 的 PR 描述编辑框。 -->
```

收到评审意见后，在同一个工作分支提交修订并再次运行 `git push`。GitHub 会把新提交添加到原 PR。[GitHub 官方指引](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request-from-a-fork)
