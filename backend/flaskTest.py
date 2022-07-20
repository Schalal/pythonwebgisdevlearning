import json
import os
from flask import Flask, request, send_file
from qgis.core import QgsVectorLayer
import time
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pandas
from sqlalchemy import create_engine
import geopandas
import base64
import urllib.parse

username = "DB_USERNAME"
password = "DB_PWD"
service = "DB_SERVICES"
port = "DB_PORT"
databaseName = "DB_NAME"
schemaName = "sc_citysps"
roadTableName = "tr_values_20220710"
gridTableName = "tg_values_20220515"

with open(r"E:\citySystem\TestFlaskReact\dbInfo.json", 'r') as f:
    dbInfo = json.load(f)
shpFilePath = r"E:\DEM\landCoverage.shp"
gridFilePath = r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_grid_y.shp"
mydb = create_engine(f"postgresql://{dbInfo[username]}:{urllib.parse.quote_plus(dbInfo[password])}"
                     f"@{dbInfo[service]}:{dbInfo[port]}"
                     f"/{dbInfo[databaseName]}")
baseDir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
CORS(app, resources=r'/*')

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{dbInfo[username]}:{dbInfo[password]}@{dbInfo[service]}:" \
                                        f"{dbInfo[port]}/{dbInfo[databaseName]}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


class gridResource(db.Model):
    __tablename__ = 'worldheritagepoint'
    id = db.Column(db.Integer, primary_key=True)
    cid = db.Column(db.Integer, index=True)
    resvalid = db.Column(db.Integer, index=True)
    value = db.Column(db.Float)


@app.route("/featureCount", methods=['POST'])
def getFeatureCount():
    path = request.json['path']
    currentTime = time.strftime('%Y-%m-%d %H:%M:%S')
    print(f"{currentTime}接收到一个POST请求~")
    if len(path) != 0:
        landCoverageLayer = QgsVectorLayer(path, "landCoverage", "ogr")
    else:
        landCoverageLayer = QgsVectorLayer(shpFilePath, "landCoverage", "ogr")
    count = landCoverageLayer.featureCount()
    return json.dumps({"count": count}, ensure_ascii=False)


@app.route("/testQuery", methods=['POST'])
def getSQLResult():
    # 直接使用sqlalchemy进行数据库数据提取
    testSql = f"select * from {schemaName}.{gridTableName} where resvalid=42"
    queryDataFrame = pandas.read_sql_query(testSql, mydb)
    gridGeoDataFrame = geopandas.read_file(gridFilePath)
    gridGeoDataFrame['geometry'] = gridGeoDataFrame['geometry'].apply(lambda x: x.centroid)
    gridGeoDataFrame = geopandas.GeoDataFrame.merge(gridGeoDataFrame, queryDataFrame, how='left',
                                                    left_on='Tid', right_on='cid')
    return gridGeoDataFrame.to_json()


@app.route("/odFlow", methods=['POST'])
def getOdFlowData():
    subdistrictODDF = pandas.read_csv(r"E:\citySystem\2022_spring\weekn\data0512\输出数据\sod\sod_transvolume.csv")
    subdistrictGDF = geopandas.read_file(r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_subdistrict_y.shp")
    subdistrictCentroid = subdistrictGDF['geometry'].apply(lambda x: x.centroid)
    subdistrictCentroid4326 = subdistrictCentroid.to_crs("EPSG:4326")
    xDict = dict(zip(subdistrictGDF['STID'].astype(int).values, subdistrictCentroid4326.apply(lambda x: x.x)))
    yDict = dict(zip(subdistrictGDF['STID'].astype(int).values, subdistrictCentroid4326.apply(lambda x: x.y)))
    subdistrictODDF['sourceX'] = subdistrictODDF['OZone_STID'].apply(lambda x: xDict[x])
    subdistrictODDF['sourceY'] = subdistrictODDF['OZone_STID'].apply(lambda x: yDict[x])
    subdistrictODDF['targetX'] = subdistrictODDF['DZone_STID'].apply(lambda x: xDict[x])
    subdistrictODDF['targetY'] = subdistrictODDF['DZone_STID'].apply(lambda x: yDict[x])
    initialJson = subdistrictODDF.to_json(orient="table")
    return initialJson


@app.route("/")
def test():
    return '<h1>Hello!Flask~~~</h1>'


@app.route("/gridPolygon", methods=['POST'])
def getGridPolygonGeoJson():
    gridGDF = geopandas.read_file(r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_grid_y.shp")
    gridAttributeDF = pandas.read_csv(r"E:\citySystem\2022_spring\weekn\data0512\输出数据\g\g_attribute_2.csv")
    gridGDF['geometry'] = gridGDF['geometry'].to_crs(epsg=4326)
    gridGDF = geopandas.GeoDataFrame.merge(gridGDF, gridAttributeDF, left_on="Tid", right_on="TID", how="left")
    # gridGDF = geopandas.read_file(r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_subdistrict_y.shp")
    # gridGDF['geometry'] = gridGDF['geometry'].to_crs("EPSG:4326")
    return gridGDF.to_json()


@app.route("/pngString", methods=['POST'])
def getPngBase64StringFromDB():
    pngPicture = open(r"E:\citySystem\TestFlaskReact\Newxx.png", 'rb')
    pngBase64Code = "data:image/png;base64," + base64.b64encode(pngPicture.read()).decode("utf-8")
    print(pngBase64Code)
    pngPicture.close()
    return json.dumps({"code": pngBase64Code}, ensure_ascii=False)


@app.route("/gridCentroid", methods=['POST'])
def getGridCentroidGeoJson():
    gridGDF = geopandas.read_file(r"E:\citySystem\BeijingDataExtraction\beijingBadGridCentroid.shp")
    gridAttributeDF = pandas.read_csv(r"E:\citySystem\2022_spring\weekn\data0512\输出数据\g\g_attribute_2.csv")
    gridGDF = geopandas.GeoDataFrame.merge(gridGDF, gridAttributeDF, left_on="Tid", right_on="TID", how="left")
    # gridGDF = geopandas.read_file(r"E:\citySystem\2022_spring\weekn\data0512\输入数据\svd\svd_subdistrict_y.shp")
    # gridGDF['geometry'] = gridGDF['geometry'].to_crs("EPSG:4326")
    return gridGDF.to_json()


@app.route("/subdistrictLine", methods=['POST'])
def getSubdistrictLine():
    lineGDF = geopandas.read_file("E:/citySystem/BeijingDataExtraction/beijingSubdistrictLine.shp")
    return lineGDF.to_json()


@app.route("/download", methods=["POST", "GET"])
def downloadFile():
    # sourceId = request.json['id']
    sourceId = 2403
    print(sourceId)
    selectIdSql = "select distinct resvalid from sc_citysps.tr_values_20220710"
    idDataFrame = pandas.read_sql_query(selectIdSql, mydb)
    if sourceId not in idDataFrame["resvalid"].values:
        return 0
    testSql = f"select * from {schemaName}.{roadTableName} where resvalid={sourceId}"
    queryDataFrame = pandas.read_sql_query(testSql, mydb)
    path = fr"E:\citySystem\TestFlaskReact\downloadedFiles/{sourceId}.csv"
    queryDataFrame.to_csv(path, index=False)
    return send_file(path, mimetype='text/csv', attachment_filename=f"{sourceId}.csv", as_attachment=True)


if __name__ == "__main__":
    app.run(port=1234)
