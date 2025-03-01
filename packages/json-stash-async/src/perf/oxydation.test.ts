import {
  addClasses,
  clearSerializers,
  stash,
  stashAsync,
  unstash,
} from "../index";

describe("performance", () => {
  beforeEach(() => clearSerializers());
  it("simple: stashAsync in less than 40ms", async () => {
    const start = Date.now();
    await stashAsync({
      id: "12345-12345-12345-12345",
      name: "12345-12345-12345-12345",
      name1: "12345-12345-12345-12345",
      name2: "My World",
      name3: "My World",
      name4: "My World",
      name5: "My World",
      saveVersion: 40,
      totalElapsedTime: 170000000,
      totalOfflineTime: 170000000,
      lastSavedTime: 170000000,
      lastSavedTime1: 170000000,
      lastSavedTime2: 170000000,
      lastSavedTime3: 170000000,
      lastSavedTime4: 170000000,
      lastSavedTime5: 170000000,
      lastSavedTime6: 170000000,
      lastSavedTime7: 170000000,
      lastSavedTime8: 170000000,
      lastSavedTime9: 170000000,
    });
    const saveDuration = Date.now() - start;
    console.log(saveDuration);
    expect(saveDuration).toBeLessThan(40);
  });
  it("simple: stash in less than 2ms", () => {
    const start = Date.now();
    stash({
      id: "12345-12345-12345-12345",
      name: "12345-12345-12345-12345",
      name1: "12345-12345-12345-12345",
      name2: "My World",
      name3: "My World",
      name4: "My World",
      name5: "My World",
      saveVersion: 40,
      totalElapsedTime: 170000000,
      totalOfflineTime: 170000000,
      lastSavedTime: 170000000,
      lastSavedTime1: 170000000,
      lastSavedTime2: 170000000,
      lastSavedTime3: 170000000,
      lastSavedTime4: 170000000,
      lastSavedTime5: 170000000,
      lastSavedTime6: 170000000,
      lastSavedTime7: 170000000,
      lastSavedTime8: 170000000,
      lastSavedTime9: 170000000,
    });
    const saveDuration = Date.now() - start;
    console.log("Saved game state within " + saveDuration + "ms");
    expect(saveDuration).toBeLessThan(2);
  });
  it("large: stashAsync in less than 3000ms", async () => {
    const bloated: any = { circular: [], regexes: [], maps: [] };
    for (let i = 0; i < 10000; i++) {
      bloated.circular[i] = bloated;
      bloated.regexes[i] = /me/i;
      bloated.maps[i] = new Map();
      bloated.maps[i].set("self", bloated);
    }
    const start = Date.now();
    await stashAsync(bloated);
    const saveDuration = Date.now() - start;
    console.log("Saved game state within " + saveDuration + "ms");
    expect(saveDuration).toBeLessThan(3000);
  }, 50000);
  it("large: stash in less than 500ms", () => {
    const bloated: any = { circular: [], regexes: [], maps: [] };
    for (let i = 0; i < 10000; i++) {
      bloated.circular[i] = bloated;
      bloated.regexes[i] = /me/;
      bloated.maps[i] = new Map();
      bloated.maps[i].set("me", bloated);
    }
    const start = Date.now();
    stash(bloated);
    const saveDuration = Date.now() - start;
    console.log("Saved game state within " + saveDuration + "ms");
    expect(saveDuration).toBeLessThan(500);
  });
  it("can unstash the savedGame", () => {
    addClasses(
      World,
      Player,
      Settlement,
      Building,
      BuildingUpgradeManager,
      UnitGroup,
      PlayerResearch,
      ResourceInfo,
      Skill,
      LevelInfo,
      UnitMovementManager,
      BarbarianAttackActionStrategy,
      UnitProductionManager,
      AchievementManager,
      VaultUpgradeManager,
      WorldMap,
      MapTile,
    );
    const orig = JSON.stringify(savedGame);
    const unstashed = unstash(orig);
    expect(unstashed).toBeDefined();
    console.log(unstashed);

    let start = Date.now();
    stash(unstashed);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(500);
    console.log(`stashed in ${elapsed}ms`);
  });
});

class World {}
class Player {}
class Settlement {}
class Building {}
class BuildingUpgradeManager {}
class UnitGroup {}
class PlayerResearch {}
class ResourceInfo {}
class Skill {}
class LevelInfo {}
class UnitMovementManager {}
class BarbarianAttackActionStrategy {}
class UnitProductionManager {}
class AchievementManager {}
class VaultUpgradeManager {}
class WorldMap {}
class MapTile {}

const savedGame = {
  world: {
    $type: "World",
    data: {
      players: [
        {
          $type: "Player",
          data: {
            settlements: [
              {
                $type: "Settlement",
                data: {
                  buildingsDictionary: {
                    "0": {
                      $type: "Building",
                      data: {
                        id: 1,
                        playerId: 0,
                        settlementId: 0,
                        isWorking: false,
                        resourcesUntilNextLevel: [
                          [7, 15000000000],
                          [6, 9000000000],
                          [5, 4500000001],
                          [0, 350000001],
                          [2, 400000001],
                          [1, 200000000],
                        ],
                        resourceProductionInfoList: {
                          $type: "Map",
                          data: [
                            [
                              0,
                              {
                                currentProductionPerSeconds: 10285734.049920006,
                                calculatedProductionPerWorker: 40.40593200000002,
                              },
                            ],
                          ],
                        },
                        exampleProperty:
                          "at this level, about 10 more properties are available",
                      },
                    },
                  },
                  lastWorkerAssignmentPosition: 3,
                  playerId: 0,
                  settlementId: 0,
                  totalPopulation: 2454370,
                  idlePopulation: 0,
                  location: {
                    x: 500,
                    y: 500,
                  },
                  buildingUpgradeManager: {
                    $type: "BuildingUpgradeManager",
                    data: {
                      maxQueuedUpgrades: 38,
                      maxConcurrentUpgrades: 4,
                      upgradeQueue: [],
                      runningUpgrades: {
                        $type: "Map",
                        data: [],
                      },
                      playerId: 0,
                      settlementId: 0,
                    },
                  },
                },
              },
            ],
            units: {
              $type: "Map",
              data: [
                [
                  0,
                  {
                    $type: "UnitGroup",
                    data: {
                      amount: 1224932,
                      totalProduced: 1628641,
                      productionCostIncreaseFactorReduction: 0,
                      unitType: 0,
                    },
                  },
                ],
                [
                  2,
                  {
                    totalProduced: 407103,
                    unitType: 2,
                    amount: 399547,
                    productionCostIncreaseFactorReduction: 0,
                  },
                ],
                [
                  1,
                  {
                    totalProduced: 810275,
                    unitType: 1,
                    amount: 806821,
                    productionCostIncreaseFactorReduction: 0,
                  },
                ],
                [
                  3,
                  {
                    totalProduced: 162002,
                    unitType: 3,
                    amount: 162002,
                    productionCostIncreaseFactorReduction: 0,
                  },
                ],
                [
                  4,
                  {
                    totalProduced: 100946,
                    unitType: 4,
                    amount: 100946,
                    productionCostIncreaseFactorReduction: 0,
                  },
                ],
                [
                  5,
                  {
                    totalProduced: 5,
                    unitType: 5,
                    amount: 0,
                    productionCostIncreaseFactorReduction: 4,
                  },
                ],
              ],
            },
            isResearching: false,
            playerModifiers: {
              info: "at this level, about 10 properties",
            },
            playerStatistic: {
              totalBash: 893254,
              bashHistoryAttacking: {
                $type: "Map",
                data: [
                  [59257.82159926597, 0],
                  [59575.29659925365, 301.5],
                  [59887.82159924152, 301.5],
                  [59928.77159923993, 301.5],
                  [60152.79659923124, 301.5],
                  [60154.82159923116, 301.5],
                  [60155.79659923112, 301.5],
                  [60209.64659922903, 301.5],
                  [60285.53209922722, 301.5],
                  [60300.90709922662, 301.5],
                  [60510.307099218495, 301.5],
                  [60545.18209921714, 301.5],
                  [60546.75709921708, 301.5],
                  [60547.88209921704, 301.5],
                  [60549.00709921699, 301.5],
                  [60549.90709921696, 301.5],
                  [60550.88209921692, 301.5],
                  [60551.782099216885, 301.5],
                  [64815.66669905609, 721.5],
                  [67971.92819895386, 876.5],
                  [84532.41929831183, 2692],
                  [121716.5230968788, 3827.5],
                  [126203.88459670037, 8324],
                  [137864.76329738376, 13375],
                  [152865.7198995764, 26189],
                  [166767.5272014638, 26191],
                  [167270.1022015418, 26191],
                  [167423.25220156557, 34464],
                  [167587.127201591, 34464],
                  [167598.6772015928, 34465.5],
                  [167600.32720159306, 34465.5],
                  [167601.9022015933, 34465.5],
                  [167602.65220159342, 34465.5],
                  [167603.40220159353, 34465.5],
                  [167604.15220159365, 34465.5],
                  [167604.90220159377, 34465.5],
                  [167605.65220159388, 34465.5],
                  [167606.402201594, 34465.5],
                  [167607.45220159416, 34465.5],
                  [167608.4272015943, 34465.5],
                  [167613.4522015951, 34465.5],
                  [167614.35220159523, 34465.5],
                  [193654.68200552426, 64272],
                  [205270.08110725883, 67969.5],
                  [208511.13520760124, 75425.5],
                  [218974.52840911443, 85703],
                  [224136.39340978704, 125842],
                  [230880.42621071383, 162424],
                  [249155.04301328587, 180446.5],
                  [249257.49301330178, 180448.5],
                  [249262.44301330255, 180448.5],
                  [249263.4180133027, 180449.5],
                  [249264.1680133028, 180450.5],
                  [249264.54301330287, 180451.5],
                  [249264.91801330293, 180452.5],
                  [249265.21801330298, 180453.5],
                  [249266.26801330314, 180453.5],
                  [249266.5680133032, 180453.5],
                  [249267.01801330326, 180453.5],
                  [249267.76801330337, 180453.5],
                  [249268.6680133035, 180453.5],
                  [249269.56801330365, 180453.5],
                  [249272.11801330405, 180453.5],
                  [279291.6711179992, 206410.5],
                  [284420.5288188429, 228044],
                  [293490.4013204683, 240564],
                  [311123.81082353805, 253945],
                  [313986.6349239998, 263624],
                  [331593.9342988945, 281386.5],
                  [392460.18818056904, 343833],
                  [409446.2109819388, 345908],
                  [446609.0988845285, 391401.5],
                  [471166.3060864613, 450091.5],
                  [631709.8204673416, 451468],
                  [708433.5081512112, 463339.5],
                  [813194.6602550378, 468427.5],
                  [870737.4348430493, 513772.5],
                  [886221.0860402726, 516105.5],
                  [898805.318738023, 561917.5],
                  [1013369.7234199322, 564709],
                  [1174319.587229111, 678969.5],
                  [1279556.2167056534, 893254],
                ],
              },
              totalPointsHistory: {
                $type: "Map",
                data: [
                  [950400, 4808],
                  [954000, 4859],
                  [957600, 4898],
                  [961200, 4927],
                  [972000, 4931],
                  [1000800, 5070],
                  [1011600, 6177],
                  [1015200, 6182],
                  [1022400, 6211],
                  [1044000, 6225],
                  [1058400, 6235],
                  [1126800, 6246],
                  [1130400, 6258],
                  [1137600, 6270],
                  [1166400, 6301],
                  [1170000, 6322],
                  [1173600, 6341],
                  [1209600, 6363],
                  [1220400, 6366],
                  [1256400, 6398],
                  [1278000, 6409],
                  [1288800, 6422],
                  [1292400, 6423],
                  [925200, 4725],
                  [842400, 3588],
                  [716400, 3291],
                  [777600, 3406],
                  [705600, 3231],
                  [680400, 3124],
                  [691200, 3199],
                  [676800, 3095],
                  [586800, 2142],
                  [604800, 2187],
                  [583200, 2140],
                  [514800, 1995],
                  [424800, 1818],
                  [342000, 1069],
                  [255600, 401],
                  [165600, 265],
                  [82800, 169],
                ],
              },
              totalSettlementsHistory: {
                $type: "Map",
                data: [
                  [311123.81082353805, 1],
                  [392460.18818056904, 2],
                  [631709.8204673416, 3],
                  [886221.0860402726, 4],
                  [1013369.7234199322, 5],
                ],
              },
            },
            id: 0,
            name: "Player 1",
            playerResearch: {
              $type: "PlayerResearch",
              data: {
                completedResearch: {
                  $type: "Set",
                  data: [
                    "1",
                    "4",
                    "2",
                    "3",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "11",
                    "10",
                    "21",
                    "23",
                    "25",
                    "20",
                    "19",
                    "28",
                    "22",
                    "31",
                    "14",
                    "24",
                    "27",
                    "29",
                    "54",
                    "13",
                    "32",
                    "18",
                    "30",
                    "16",
                    "17",
                    "36",
                    "12",
                    "33",
                    "34",
                    "35",
                    "37",
                    "15",
                    "26",
                    "42",
                    "38",
                    "72",
                    "44",
                    "43",
                    "45",
                    "39",
                    "40",
                    "73",
                    "46",
                    "74",
                    "55",
                    "57",
                    "58",
                    "59",
                    "48",
                    "47",
                    "52",
                    "60",
                    "61",
                    "50",
                    "75",
                    "76",
                    "77",
                    "78",
                    "79",
                    "80",
                    "81",
                    "82",
                    "83",
                    "84",
                    "53",
                    "62",
                    "67",
                    "51",
                    "41",
                    "49",
                    "85",
                    "68",
                    "65",
                    "56",
                    "66",
                    "63",
                    "69",
                  ],
                },
                currentResearch: null,
                timeLeft: 0,
                playerId: 0,
              },
            },
            currentTotalResources: {
              $type: "Map",
              data: [
                [
                  1,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 6254426580928.595,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 10281087.367740005],
                          [1, 8857399.753440006],
                          [2, 8029875.559608005],
                          [3, 7398985.697208004],
                          [4, 3915845.494848002],
                          [5, 5123554.162776002],
                        ],
                      },
                    },
                  },
                ],
                [
                  0,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 6184849890039.443,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 10285734.049920006],
                          [1, 9208167.755724005],
                          [2, 8121619.171512005],
                          [3, 7498867.254480004],
                          [4, 3958334.862300002],
                          [5, 5113866.418920003],
                        ],
                      },
                    },
                  },
                ],
                [
                  3,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 84009007489.08966,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 53458.9084386],
                          [1, 46739.234304],
                          [2, 42011.5640364],
                          [3, 41655.8097144],
                          [4, 21576.541417200002],
                          [5, 36771.03889200001],
                        ],
                      },
                    },
                  },
                ],
                [
                  4,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 6972846364078.284,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 4918519.638648002],
                          [1, 3634907.9457600014],
                          [2, 3529072.5790320016],
                          [3, 3079248.984000001],
                          [4, 1874212.6213440008],
                          [5, 2448324.1036800006],
                        ],
                      },
                    },
                  },
                ],
                [
                  2,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 6122061374222.83,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 10482717.550536005],
                          [1, 9107001.753696006],
                          [2, 8258595.017904005],
                          [3, 6854992.795728005],
                          [4, 4000917.0718440018],
                          [5, 5229234.196956003],
                        ],
                      },
                    },
                  },
                ],
                [
                  5,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 6099647016700.268,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 6475234.058496001],
                          [1, 4542738.536448001],
                          [2, 4267837.050624002],
                          [3, 3839434.712064001],
                          [4, 2077535.4163200008],
                          [5, 3253188.669696001],
                        ],
                      },
                    },
                  },
                ],
                [
                  6,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 6148491167091.587,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 7518121.521422403],
                          [1, 3895714.034352002],
                          [2, 3707101.515902402],
                          [3, 2907409.0552416015],
                          [4, 1999212.172776001],
                          [5, 3066846.235790401],
                        ],
                      },
                    },
                  },
                ],
                [
                  7,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 2844063890178.333,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 6566898.214800005],
                          [3, 1662993.9295200012],
                          [2, 1936365.6312000013],
                          [1, 1847284.8055200013],
                          [4, 955674.7547760005],
                          [5, 1174641.1586280004],
                        ],
                      },
                    },
                  },
                ],
                [
                  8,
                  {
                    $type: "ResourceInfo",
                    data: {
                      amount: 23212675021.30982,
                      currentProductionRatePerSecondBySettlement: {
                        $type: "Map",
                        data: [
                          [0, 43304.387568120015],
                          [1, 18073.740460860008],
                          [2, 15945.196538880004],
                          [3, 14797.315653120004],
                          [4, 9748.713577680002],
                          [5, 13260.434886720004],
                        ],
                      },
                    },
                  },
                ],
              ],
            },
            skills: {
              $type: "Map",
              data: [
                [
                  1,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 0.2,
                      currentXpPerSecond: 0,
                      type: 1,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 1575054.2596627122,
                        },
                      },
                    },
                  },
                ],
                [
                  2,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 0.2,
                      currentXpPerSecond: 0,
                      type: 2,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 1562007.8922730226,
                        },
                      },
                    },
                  },
                ],
                [
                  3,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 0,
                      currentXpPerSecond: 0,
                      type: 3,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 9075894.638170365,
                        },
                      },
                    },
                  },
                ],
                [
                  4,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 0,
                      currentXpPerSecond: 0,
                      type: 4,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 1750574.5380991634,
                        },
                      },
                    },
                  },
                ],
                [
                  6,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 0.2,
                      currentXpPerSecond: 0,
                      type: 6,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 1948746.8357272432,
                        },
                      },
                    },
                  },
                ],
                [
                  7,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 0,
                      currentXpPerSecond: 0,
                      type: 7,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 5872401.809442422,
                        },
                      },
                    },
                  },
                ],
                [
                  8,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 1.2000000000000002,
                      currentXpPerSecond: 0,
                      type: 8,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 4002687.805434212,
                        },
                      },
                    },
                  },
                ],
                [
                  9,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 1.9000000000000001,
                      currentXpPerSecond: 0,
                      type: 9,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 5600665.165472432,
                        },
                      },
                    },
                  },
                ],
                [
                  10,
                  {
                    $type: "Skill",
                    data: {
                      efficiencyFactor: 0,
                      currentXpPerSecond: 45.875,
                      type: 10,
                      levelInfo: {
                        $type: "LevelInfo",
                        data: {
                          maxLevel: 99,
                          experience: 13034452.508688798,
                        },
                      },
                    },
                  },
                ],
              ],
            },
            unitMovementManager: {
              $type: "UnitMovementManager",
              data: {
                unitMovementInfos: [
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 132],
                        [2, 240],
                        [1, 111],
                        [3, 101],
                        [4, 63],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728320306658,
                    startedTime: 1728308792168,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 184840],
                        [2, 55716],
                        [1, 119159],
                        [3, 24469],
                        [4, 14988],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 0,
                    targetLocation: {
                      $ref: "$.world.data.players.0.data.settlements.3.data.location",
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 242950938.06280544],
                        [0, 459036458.76969683],
                        [3, 10544402.46431505],
                        [4, 320394947.65159553],
                        [2, 4148862405.0846767],
                        [5, 8616164.352568919],
                        [6, 8799373.158551307],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 184840],
                        [2, 55716],
                        [1, 119159],
                        [3, 24469],
                        [4, 14988],
                        [5, 1],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 1626.6666666666665,
                    targetPlayerId: 1,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 1770],
                        [2, 1146],
                        [1, 1370],
                        [3, 860],
                        [4, 537],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728394930297,
                    startedTime: 1728391672338,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 261935],
                        [2, 74990],
                        [1, 157706],
                        [3, 32179],
                        [4, 19806],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 0,
                    targetLocation: {
                      $ref: "$.world.data.players.0.data.settlements.5.data.location",
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 8268737286.171113],
                        [0, 10988510587.0657],
                        [3, 107565409.34945731],
                        [4, 3459880379.951158],
                        [2, 17518396442.039146],
                        [5, 188671557.39888102],
                        [6, 354740612.7815603],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 261935],
                        [2, 74990],
                        [1, 157706],
                        [3, 32179],
                        [4, 19806],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 253.33333333333331,
                    targetPlayerId: 7,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 849],
                        [2, 522],
                        [1, 1043],
                        [3, 209],
                        [4, 130],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728535312290,
                    startedTime: 1728504949745,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 367000],
                        [2, 101256],
                        [1, 210239],
                        [3, 42685],
                        [4, 26373],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 0,
                    targetLocation: {
                      $ref: "$.world.data.players.0.data.settlements.5.data.location",
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 3624626588.7903576],
                        [0, 10693992266.890978],
                        [4, 13065459911.385227],
                        [2, 30353805711.55025],
                        [6, 2290056504.641078],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 367000],
                        [2, 101256],
                        [1, 210239],
                        [3, 42685],
                        [4, 26373],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 253.33333333333331,
                    targetPlayerId: 7,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 9069],
                        [2, 5215],
                        [1, 7383],
                        [3, 2086],
                        [4, 1303],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728565323618,
                    startedTime: 1728564806699,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 425374],
                        [2, 115849],
                        [1, 239426],
                        [3, 48523],
                        [4, 30021],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 0,
                    targetLocation: {
                      $ref: "$.world.data.players.0.data.settlements.5.data.location",
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 1722512496.9266548],
                        [0, 3959819406.47064],
                        [4, 28173306909.701263],
                        [2, 19416109164.38379],
                        [6, 4023196614.817747],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 425374],
                        [2, 115849],
                        [1, 239426],
                        [3, 48523],
                        [4, 30021],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 253.33333333333331,
                    targetPlayerId: 7,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 142],
                        [2, 328],
                        [1, 272],
                        [3, 176],
                        [4, 110],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728590494357,
                    startedTime: 1728580535517,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 439262],
                        [2, 119496],
                        [1, 246720],
                        [3, 49982],
                        [4, 30933],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 1,
                    targetLocation: {
                      $ref: "$.world.data.players.0.data.settlements.4.data.location",
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 57589743453.694916],
                        [0, 299940163.2780771],
                        [3, 367015653.069329],
                        [4, 196005627929.89606],
                        [2, 230548326739.2976],
                        [6, 39365463902.85472],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 439962],
                        [2, 119496],
                        [1, 246720],
                        [3, 49982],
                        [4, 30933],
                        [5, 1],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 1359.9999999999998,
                    targetPlayerId: 4,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 8204],
                        [2, 5321],
                        [1, 7827],
                        [3, 2129],
                        [4, 1331],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728595387025,
                    startedTime: 1728594820407,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 455594],
                        [2, 123580],
                        [1, 254886],
                        [3, 51615],
                        [4, 31954],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 0,
                    targetLocation: {
                      $ref: "$.world.data.players.0.data.settlements.5.data.location",
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 14390095069.529604],
                        [0, 1245883098.233315],
                        [3, 679641677.6068578],
                        [4, 29460752141.077915],
                        [2, 28572915653.49646],
                        [6, 6267613525.76295],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 455594],
                        [2, 123580],
                        [1, 254886],
                        [3, 51615],
                        [4, 31954],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 253.33333333333331,
                    targetPlayerId: 7,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 485],
                        [2, 324],
                        [1, 484],
                        [3, 130],
                        [4, 81],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728720199925,
                    startedTime: 1728719590237,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 607396],
                        [2, 161901],
                        [1, 331528],
                        [3, 66943],
                        [4, 41534],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 0,
                    targetLocation: {
                      $ref: "$.world.data.players.0.data.settlements.5.data.location",
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 72763446005.36653],
                        [0, 2470077346.6318936],
                        [3, 2722274521.279494],
                        [4, 174082616189.571],
                        [2, 101364788291.10756],
                        [5, 66413236733.56573],
                        [6, 81659471892.67726],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 608878],
                        [2, 161901],
                        [1, 331528],
                        [3, 66943],
                        [4, 41534],
                        [5, 1],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 217.1428571428571,
                    targetPlayerId: 7,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 9728],
                        [2, 13451],
                        [1, 14308],
                        [3, 8494],
                        [4, 5308],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728904266763,
                    startedTime: 1728884385625,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 679114],
                        [2, 231870],
                        [1, 471466],
                        [3, 94931],
                        [4, 59027],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 1,
                    targetLocation: {
                      x: 871,
                      y: 533,
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [0, 37069234148.86733],
                        [4, 839349732443.2402],
                        [2, 563492204277.7296],
                        [5, 449046453186.5861],
                        [6, 597864180958.4293],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 887274],
                        [2, 231870],
                        [1, 471466],
                        [3, 94931],
                        [4, 59027],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 1062.8571428571427,
                    targetPlayerId: 4,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                  {
                    isAttackReportForDefender: false,
                    unitsDiedOnDefender: {
                      $type: "Map",
                      data: [
                        [0, 17545],
                        [2, 19478],
                        [1, 19900],
                        [3, 19462],
                        [4, 12165],
                      ],
                    },
                    isExpedition: true,
                    result: 2,
                    finishedTime: 1728994625108,
                    startedTime: 1728991829657,
                    unitsAlive: {
                      $type: "Map",
                      data: [
                        [0, 812846],
                        [2, 296525],
                        [1, 600778],
                        [3, 120793],
                        [4, 75190],
                      ],
                    },
                    playerId: 0,
                    sourceSettlementId: 0,
                    targetSettlementId: 0,
                    targetLocation: {
                      x: 339,
                      y: 881,
                    },
                    currentState: 4,
                    sourceLocation: {
                      $ref: "$.world.data.players.0.data.settlements.0.data.location",
                    },
                    transportedResources: {
                      $type: "Map",
                      data: [
                        [1, 1503386313.5558748],
                        [0, 84181600201.55803],
                        [3, 7195839042.311596],
                        [4, 70261223189.29028],
                        [2, 251761529371.23203],
                        [6, 4220091976.275488],
                      ],
                    },
                    units: {
                      $type: "Map",
                      data: [
                        [0, 937736],
                        [2, 296525],
                        [1, 600778],
                        [3, 120793],
                        [4, 75190],
                      ],
                    },
                    timeLeftUntilNextState: 0,
                    actionDuration: 10,
                    targetActionStrategy: {
                      $type: "BarbarianAttackActionStrategy",
                      data: {},
                    },
                    travelTimeOneWay: 1182.8571428571427,
                    targetPlayerId: 5,
                    trappedUnits: {
                      $type: "Map",
                      data: [],
                    },
                  },
                ],
                playerId: 0,
              },
            },
            unitProductionManager: {
              $type: "UnitProductionManager",
              data: {
                unitProductionBatches: [
                  {
                    unitType: 2,
                    amountDone: 407103.344812249,
                    totalAmountToProduce: 7947404,
                    currentProductionRatePerSecond: 0.6362499999999988,
                  },
                  {
                    unitType: 0,
                    amountDone: 1625703.259452094,
                    totalAmountToProduce: 11176853,
                    currentProductionRatePerSecond: 2.544999999999995,
                  },
                  {
                    unitType: 1,
                    amountDone: 810275.1101332149,
                    totalAmountToProduce: 33116017,
                    currentProductionRatePerSecond: 1.2724999999999975,
                  },
                  {
                    unitType: 3,
                    amountDone: 162002.27791060723,
                    totalAmountToProduce: 4481744,
                    currentProductionRatePerSecond: 0.2544999999999995,
                  },
                  {
                    unitType: 4,
                    amountDone: 100802.27739475288,
                    totalAmountToProduce: 156446,
                    currentProductionRatePerSecond: 0.1590624999999997,
                  },
                ],
                playerId: 0,
              },
            },
            achievementManager: {
              $type: "AchievementManager",
              data: {
                unlockedAchievementIds: {
                  $type: "Set",
                  data: ["wood_100", "here_we_have_up_to_300_entries"],
                },
                playerId: 0,
              },
            },
            vaultUpgradeManager: {
              $type: "VaultUpgradeManager",
              data: {
                unlockedUpgrades: {
                  $type: "Map",
                  data: [["tax_rate", 11]],
                },
                playerId: 0,
              },
            },
          },
        },
      ],
      creationDate: 1727643111508,
      map: {
        $type: "WorldMap",
        data: {
          occupiedTiles: [
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.settlements.0.data.location",
                },
                mapTileType: 5,
                settlementId: 0,
                belongsToPlayerId: 0,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.settlements.3.data.location",
                },
                mapTileType: 5,
                settlementId: 3,
                belongsToPlayerId: 0,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.settlements.4.data.location",
                },
                mapTileType: 5,
                settlementId: 4,
                belongsToPlayerId: 0,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
                },
                mapTileType: 6,
                settlementId: 1,
                belongsToPlayerId: 7,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 4,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 5,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 6,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.settlements.5.data.location",
                },
                mapTileType: 5,
                settlementId: 5,
                belongsToPlayerId: 0,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.settlements.2.data.location",
                },
                mapTileType: 5,
                settlementId: 2,
                belongsToPlayerId: 0,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.settlements.1.data.location",
                },
                mapTileType: 5,
                settlementId: 1,
                belongsToPlayerId: 0,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.3.data.settlements.1.data.location",
                },
                mapTileType: 6,
                settlementId: 1,
                belongsToPlayerId: 3,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 7,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
                },
                mapTileType: 6,
                settlementId: 1,
                belongsToPlayerId: 4,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
                },
                mapTileType: 6,
                settlementId: 4,
                belongsToPlayerId: 6,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
                },
                mapTileType: 6,
                settlementId: 2,
                belongsToPlayerId: 4,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 8,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 3,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
                },
                mapTileType: 6,
                settlementId: 2,
                belongsToPlayerId: 6,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
                },
                mapTileType: 6,
                settlementId: 1,
                belongsToPlayerId: 6,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.8.data.settlements.1.data.location",
                },
                mapTileType: 6,
                settlementId: 1,
                belongsToPlayerId: 8,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
                },
                mapTileType: 6,
                settlementId: 3,
                belongsToPlayerId: 6,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
                },
                mapTileType: 6,
                settlementId: 1,
                belongsToPlayerId: 5,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
                },
                mapTileType: 6,
                settlementId: 2,
                belongsToPlayerId: 8,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.3.data.settlements.2.data.location",
                },
                mapTileType: 6,
                settlementId: 2,
                belongsToPlayerId: 3,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.2.data.settlements.0.data.location",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 2,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
                },
                mapTileType: 6,
                settlementId: 2,
                belongsToPlayerId: 5,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
                },
                mapTileType: 6,
                settlementId: 3,
                belongsToPlayerId: 5,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.53.targetLocation",
                },
                mapTileType: 6,
                settlementId: 2,
                belongsToPlayerId: 7,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.38.targetLocation",
                },
                mapTileType: 6,
                settlementId: 3,
                belongsToPlayerId: 4,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.3.data.settlements.3.data.location",
                },
                mapTileType: 6,
                settlementId: 3,
                belongsToPlayerId: 3,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.71.targetLocation",
                },
                mapTileType: 6,
                settlementId: 4,
                belongsToPlayerId: 7,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.41.targetLocation",
                },
                mapTileType: 6,
                settlementId: 3,
                belongsToPlayerId: 7,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.50.targetLocation",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 9,
              },
            },
            {
              $type: "MapTile",
              data: {
                location: {
                  $ref: "$.world.data.players.1.data.settlements.0.data.location",
                },
                mapTileType: 6,
                settlementId: 0,
                belongsToPlayerId: 1,
              },
            },
          ],
          occupiedLocations: {
            $type: "Set",
            data: [
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.22.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.54.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.54.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.54.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.54.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.54.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.54.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.5.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.54.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.13.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.12.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.14.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.29.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.29.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.29.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.29.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.29.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.29.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.16.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.6.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.2.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.20.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.20.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.4.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.20.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.47.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.20.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.3.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.47.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.20.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.6.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.47.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.20.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.1.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.47.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.20.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.18.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.45.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.47.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.40.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.19.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.36.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.37.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.37.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.37.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.37.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.7.data.unitMovementManager.data.unitMovementInfos.20.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.37.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.33.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.5.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.33.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.11.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.35.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.35.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.35.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.35.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.34.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.50.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.34.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.4.data.unitMovementManager.data.unitMovementInfos.15.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.9.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.46.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.settlements.3.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.1.data.settlements.0.data.location",
              },
              {
                $$ref:
                  "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.46.targetLocation",
              },
              {
                $$ref:
                  "$.world.data.players.9.data.settlements.0.data.location",
              },
              {
                $ref: "$.world.data.players.0.data.settlements.0.data.location",
              },
              {
                $ref: "$.world.data.players.0.data.settlements.3.data.location",
              },
              {
                $ref: "$.world.data.players.0.data.settlements.4.data.location",
              },
              {
                $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.0.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.9.sourceLocation",
              },
              {
                $ref: "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.8.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.31.sourceLocation",
              },
              {
                $ref: "$.world.data.players.0.data.settlements.5.data.location",
              },
              {
                $ref: "$.world.data.players.0.data.settlements.2.data.location",
              },
              {
                $ref: "$.world.data.players.0.data.settlements.1.data.location",
              },
              {
                $ref: "$.world.data.players.3.data.settlements.1.data.location",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.33.sourceLocation",
              },
              {
                $ref: "$.world.data.players.0.data.unitMovementManager.data.unitMovementInfos.7.targetLocation",
              },
              {
                $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.10.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.17.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.46.sourceLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.37.sourceLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.21.targetLocation",
              },
              {
                $ref: "$.world.data.players.8.data.settlements.1.data.location",
              },
              {
                $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.23.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.32.targetLocation",
              },
              {
                $ref: "$.world.data.players.2.data.unitMovementManager.data.unitMovementInfos.26.targetLocation",
              },
              {
                $ref: "$.world.data.players.3.data.settlements.2.data.location",
              },
              {
                $ref: "$.world.data.players.2.data.settlements.0.data.location",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.51.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.52.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.53.targetLocation",
              },
              {
                $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.38.targetLocation",
              },
              {
                $ref: "$.world.data.players.3.data.settlements.3.data.location",
              },
              {
                $ref: "$.world.data.players.1.data.unitMovementManager.data.unitMovementInfos.71.targetLocation",
              },
              {
                $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.41.targetLocation",
              },
              {
                $ref: "$.world.data.players.3.data.unitMovementManager.data.unitMovementInfos.50.targetLocation",
              },
              {
                $ref: "$.world.data.players.1.data.settlements.0.data.location",
              },
            ],
          },
          configuration: {
            height: 1000,
            width: 1000,
          },
        },
      },
    },
  },
  totalElapsedTime: 1440459.1415031615,
};
