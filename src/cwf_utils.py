import requests  # for api calls

API_URL = "downforacross-com.onrender.com"


async def getResults(
    resultsPage=0, pageSize=50, searchTerm="", standardSize="true", miniSize="true"
):
    """return json results of list of puzzles from cwf given search criteria"""

    response = requests.get(
        f"https://{API_URL}/api/puzzle_list?"
        f"page={resultsPage}&"
        f"pageSize={pageSize}&"
        f"filter%5BnameOrTitleFilter%5D={searchTerm}&"
        f"filter%5BsizeFilter%5D%5BMini%5D={miniSize}&"
        f"filter%5BsizeFilter%5D%5BStandard%5D={standardSize}"
    )
    responseJson = response.json()
    if len(responseJson["puzzles"]) == 0:
        return None
    return responseJson


async def getGID():
    """get gid from cwf api counter"""
    gidCounter = requests.post(f"https://{API_URL}/api/counters/gid")
    gidCounterJson = gidCounter.json()
    return gidCounterJson["gid"]


async def createGame(pid, gid):
    """create game instance in cwf database"""
    data = {"gid": gid, "pid": pid}
    requests.post(f"https://{API_URL}/api/game", json=data)
