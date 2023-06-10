## 資料說明

原始資料：
* dataset/join_database_w_definitions.csv
* dataset/join_database_w_definitions.xlsx


視需求先對原始資料進行資料前處理(依照資料取樣分類)：
* dataset/join_database_all.csv (全部取樣)
* dataset/join_database_education.csv (依教育程度取樣)
* dataset/join_database_gender.csv (依性別取樣)
* dataset/join_database_location.csv (依居住區域取樣)

完成計算平均勞動力年齡(依照資料取樣分類)：
* cleanDataset/clean_education.csv (依教育程度取樣)
* cleanDataset/clean_gender.csv (依性別取樣)
* cleanDataset/clean_location.csv (依居住區域取樣)
* cleanDataset/clean_lineplotData.csv (統整上面3類取樣資料)

> clean_lineplotData.csv是實際拿來畫折線圖的資料，其餘資料都是過程使用到的參考資料。

## ipynb檔說明

dataClean.ipynb：
* 觀察原始資料各年度的資料筆數
* 資料前處理 (資料缺值填補)
* 計算各類指標的勞動市場平均年齡
* 依指標類別產生對應的CSV檔
