# 如何提交 Pull Request

这份指南适用于《九霄问道》场景资产库。下面用 **A06 水亭**演示如何提交一张三视图。贡献其他资产时，换成实际的资产编号、目录和分支名。

## 1. 找到资产并创建分支

从[资产清单](./资产清单.md)找到资产编号和目录，参考[主概念图](./主概念图-v02-天阶加陡.png)和 [README 的三视图规范](./readme.md#三视图工作提示词)。先看该目录已有的稿件，也可以在 [Pull requests](https://github.com/cosmorithm/Cultivation-sect-scene-Game-Asset/pulls) 搜索同一编号。

在 GitHub 仓库页点 **Fork**，把仓库复制到自己的账号。把下面的 `YOUR_USERNAME` 换成你的 GitHub 用户名，再在终端运行。

```bash
git clone https://github.com/YOUR_USERNAME/Cultivation-sect-scene-Game-Asset.git
cd Cultivation-sect-scene-Game-Asset
git remote add upstream https://github.com/cosmorithm/Cultivation-sect-scene-Game-Asset.git
git fetch upstream
git switch -c asset/a06-water-pavilion upstream/main
```

`origin` 是你自己的 Fork，`upstream` 是原仓库。已有原仓库写权限的协作者可以直接在原仓库的 `main` 最新提交上建工作分支，后面的提交和推送步骤相同。

## 2. 保存和检查文件

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

## 3. 在 GitHub 创建 PR

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
