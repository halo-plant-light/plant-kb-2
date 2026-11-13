# plant-kb-2

植物知识库,共 260 个物种,数据来源于 `plant-kb-4-2/species-kb`。

## 在线浏览

站点是纯静态页面,支持搜索(学名、常用名、科、属、原产地)、按生长类型/养护难度/科/IUCN 等级筛选、排序,点击卡片查看详情,并适配手机和深色模式。

发布到 GitHub Pages:仓库 Settings → Pages → Source 选 `Deploy from a branch`,分支选 `main`,目录选 `/ (root)`。发布后访问 `https://<用户名>.github.io/<仓库名>/`。

本地预览(页面通过 `fetch` 读取数据,不能直接双击打开):

```
python3 -m http.server 8000
```

然后访问 http://localhost:8000。

## 更新数据

修改或新增 `species-kb/*.json` 后,重新生成站点使用的合并数据文件并一起提交:

```
python3 scripts/build_data.py
```

## 目录结构

```
index.html           页面入口
assets/              样式和脚本
data/species.json    由 build_data.py 生成的合并数据
scripts/build_data.py
species-kb/
  <id>.json          每个物种一个文件,文件名与 id 一致
```

## 文件格式

每个文件包含 `id`、`scientificName` 和 `projects`。`projects` 以数据来源项目为键,目前只有 `k-world-flora`,其下的字段如下:

| 字段 | 说明 | 覆盖 |
| --- | --- | --- |
| `id` | 物种 ID | 260 |
| `genus` / `family` | 属 / 科 | 260 |
| `scientificNameWithoutAuthor` / `scientificNameAuthorship` | 学名(不含命名人)/ 命名人 | 260 |
| `gbifId` / `powoId` | GBIF / POWO 标识符 | 260 |
| `origin` | 原产地 | 260 |
| `growth_type` | 生长类型,如 upright、climbing、shrub、tree、rosette | 260 |
| `height_range` | 株高范围 | 260 |
| `care_difficulty` | 养护难度:very_easy、easy、moderate、hard、expert | 260 |
| `description` | 简介 | 260 |
| `commonNames` | 常用名列表 | 246 |
| `iucnCategory` | IUCN 保护等级 | 52 |
