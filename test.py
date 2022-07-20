import pandas
import geopandas
import holoviews
from datashader.bundling import directly_connect_edges
from holoviews.operation.datashader import dynspread, datashade
from selenium import webdriver
from PIL import Image
valueFieldName = 'sod_transvolume'


def getPngBase64StringFromDB():
    # r_nodes_df = pandas.read_parquet(r"E:\citySystem\2022_spring\visualization\calvert_uk_research2017.snappy.parq"
    #                                  r"\calvert_uk_research2017_nodes.snappy.parq")
    # r_edges_df = pandas.read_parquet(r"E:\citySystem\2022_spring\visualization\calvert_uk_research2017.snappy.parq"
    #                                  r"\calvert_uk_research2017_edges.snappy.parq")
    transVolumeDf = pandas.read_csv(r"E:\citySystem\2022_spring\weekn\data0512\data0512数据更新"
                                    r"\输出数据\sod\sod_transvolume.csv")
    subdistrictDf = geopandas.read_file(r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_subdistrict_y.shp")
    subdistrictCentroid = subdistrictDf['geometry'].apply(lambda x: x.centroid)
    subdistrictCentroid4326 = subdistrictCentroid.to_crs("EPSG:3857")
    xList = subdistrictCentroid4326.apply(lambda x: x.x)
    yList = subdistrictCentroid4326.apply(lambda x: x.y)
    idList = subdistrictDf['STID'].astype(int).values
    centroidDf = pandas.DataFrame({
        "ID": idList,
        "x": xList,
        "y": yList
    })
    centroidDf.set_index("ID", inplace=True)
    transVolumeDf.rename(columns={"OZone_STID": "source", "DZone_STID": "target"}, inplace=True)
    r_nodes = holoviews.Points(centroidDf, label="Nodes")
    r_edges = holoviews.Curve(transVolumeDf, label="Edges")
    r_direct = holoviews.Curve(directly_connect_edges(r_nodes.data, r_edges.data), label="Direct")
    composition = datashade(r_direct)
    holoviews.save(composition, "./test3.png")
    # print("ee")


def convertImage():
    img = Image.open("./xx.png")
    img = img.convert("RGBA")

    datas = img.getdata()

    newData = []

    for items in datas:
        if items[0] == 255 and items[1] == 255 and items[2] == 255:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(items)

    img.putdata(newData)
    img.save("./Newxx.png", "PNG")
    print("Successful")


def getGridCentroidGeoJson():
    gridGDF = geopandas.read_file(r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_grid_y.shp")
    gridAttributeDF = pandas.read_csv(r"E:\citySystem\2022_spring\weekn\data0512\输出数据\g\g_attribute_2.csv")
    gridGDF['geometry'] = gridGDF['geometry'].centroid.to_crs("EPSG:4326")
    print(gridGDF['geometry'])
    gridGDF = geopandas.GeoDataFrame.merge(gridGDF, gridAttributeDF, left_on="Tid", right_on="TID", how="left")
    # gridGDF = geopandas.read_file(r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_subdistrict_y.shp")
    # gridGDF['geometry'] = gridGDF['geometry'].to_crs("EPSG:4326")
    return gridGDF.to_json()
# getPngBase64StringFromDB()
# convertImage()
getGridCentroidGeoJson()
