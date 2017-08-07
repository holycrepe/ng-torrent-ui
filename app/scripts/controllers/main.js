/* global angular */
'use strict';

Array.prototype.chunk = function(groupsize){
  var sets = [], chunks, i = 0;
  chunks = this.length / groupsize;

  while(i < chunks){
    sets[i] = this.splice(0,groupsize);
    i++;
  }

  return sets;
};



/**
 * @ngdoc function
 * @name ngTorrentUiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ngTorrentUiApp
 */
angular.module('ngTorrentUiApp')
    .controller('TorrentsCtrl', function($scope, $window, $uibModal, $filter, $timeout, $log, torrentServerService, Torrent, toastr, $cookies, ntuConst) {

      //var LoopCounter = Puchalapalli.Execution.Counters.LoopCounter;
      var Counters = apEMP.Classes.Counters;
      var LoopCounter = Counters.LoopCounter;
      var Range = Counters.Range;

      function runLoopCounterTest() {
        var array = [1, 2, 3, 4, 5];
        var counter = new LoopCounter(array);
        for (;counter.active;counter.step()) {
          console.log(`Looping with index ${counter.index}`)
        }
        console.log("Loop complete");
      }
      runLoopCounterTest();

        $scope.headerHeight = 350;
        $scope.queueMovement = {
          delta: 1,
          maxRequestSize: 175,
          isRelative: false,
          recurseIfRelative: true,
          useCustomDelta: false
        };
        $scope.options = {
          autoReload: {
            timeout: 5000,
            enabled: true
          }
        };
        // On window resize => resize the app
        $scope.setListHeight = function() {
            var newHeight = $window.innerHeight - 260; // - $scope.headerHeight;
            $scope.listHeight = (newHeight > 250) ? newHeight : 250;
        };

        angular.element($window).bind('resize', function() {
            $scope.setListHeight();
            $scope.$apply();
        });

        // Initiate the resize function default values
        $scope.setListHeight();

        $scope.equals = angular.equals;

        $scope.labels = [];
        $scope.labelColorMap = {};

        $scope.torrents = [];
        $scope.filteredtorrents = [];
        $scope.selectedtorrents = [];

        var torrentsMap = Torrent.cache;
        var reloadTimeout;

        $scope.newtorrent = '';
        $scope.newtorrentfiles = [];
        var labelarrayfornewtorrents = [];
        var maxQueuePosition = 0;

        $scope.uploadDropSupported = true;

        var saveCookie = function(cookieName,value) {
            var obj = angular.toJson(value);
            $cookies.put(cookieName, obj);
            return value;
        };

        var saveOptions = function() {
          saveCookie(ntuConst.options, $scope.options);
        };

        var loadCookie = function(cookieName) {
            return angular.fromJson($cookies.get(cookieName));
        };

        if ($cookies.get(ntuConst.starredItems)) {
            $scope.starredItems = loadCookie(ntuConst.starredItems);
        }
        if ($cookies.get(ntuConst.options)) {
            angular.merge($scope.options, loadCookie(ntuConst.options));
        }
        if ($cookies.get(ntuConst.lastQueueMovement)) {
            angular.merge($scope.queueMovement, loadCookie(ntuConst.lastQueueMovement));
        }

        var labelColors = ['#B0C4DE', '#B0E0E6', '#87CEEB', '#87CEFA', '#00BFFF', '#1E90FF', '#6495ED', '#4682B4', '#4169E1', '#0000FF', '#0000CD', '#6A5ACD', '#7B68EE', '#00008B', '#000080', '#191970'];
        var updateLabelColorsMap = function(labels) {
            if (labels) {
                var i;
                var tot = labelColors.length;
                var sorted = angular.copy(labels).sort(function(aLbl, bLbl) {
                    var aVal = aLbl[1];
                    var bVal = bLbl[1];
                    if (aVal === bVal) {
                        return 0;
                    } else if (aVal > bVal) {
                        return 1;
                    } else {
                        return -1;
                    }
                });
                for (i = 0; i < sorted.length; i++) {
                    $scope.labelColorMap[sorted[i][0]] = labelColors[i % tot];
                }
            }
        };

        function getSelectedAndUpdateGlobals(torrentsArr) {
            var i, upSpeed = 0,
                downSpeed = 0;
            var sel = [];
            for (i = 0; i < torrentsArr.length; i++) {
                if (torrentsArr[i].selected) {
                    sel.push(torrentsArr[i]);
                }
                upSpeed += torrentsArr[i].uploadSpeed;
                downSpeed += torrentsArr[i].downloadSpeed;
            }
            $scope.uploadSpeed = upSpeed;
            $scope.downloadSpeed = downSpeed;
            return sel;
        }

        $scope.addTorrentFilesOrUrl = function(urlOrFiles) {
            var add = function(dir, subpath, label, minQueue) {
                var queueLabels = function(label, minQueue, numOfNewTorrents) {
                    if (label && label.length > 0) {
                        while(numOfNewTorrents > 0) {
                            labelarrayfornewtorrents.push({
                                minQueue: minQueue,
                                label:label
                            });
                            numOfNewTorrents--;
                        }
                    }
                };
                if (typeof urlOrFiles === 'string') {
                    torrentServerService.addTorrentUrl(urlOrFiles, dir, subpath).then(function() {
                        toastr.info('Link sent to server succesfully', null, {
                            timeOut: 2500
                        });
                        $scope.newtorrent = '';
                        queueLabels(label,minQueue,1);
                    });
                } else {
                    if (torrentServerService.uploadTorrent) {
                        var i, success = 0, fails = 0;
                        var callback = function( data /* , status, headers, config */ ) {
                            if (data.error) {
                                fails++;
                            } else {
                                success++;
                            }
                            if ((success + fails) === urlOrFiles.length) {
                                if (success > 0) {
                                    toastr.info(success + ' torrents added succesfully', null, {
                                        timeOut: 2500
                                    });
                                    queueLabels(label,minQueue,success);
                                }
                                if (fails > 0) {
                                    toastr.warning('Error adding ' + fails + ' torrents', null, {
                                        timeOut: 2500
                                    });
                                }
                                $scope.newtorrentfiles = [];
                            }
                        };
                        for (i = 0; i < urlOrFiles.length; i++) {
                            var file = urlOrFiles[i];
                            torrentServerService.uploadTorrent(file, dir, subpath).success(callback);
                        }
                    } else {
                        toastr.warning('Files upload not supported for ' + torrentServerService.getVersion(), null, {
                            timeOut: 2500
                        });
                    }
                }
            };

            var openAddDialog = function(directories) {
                $scope.directories = directories;

                var modalInstance = $uibModal.open({
                    templateUrl: 'downloadOptionsModal.html',
                    backdrop: true,
                    scope: $scope
                });

                modalInstance.result.then(function(res) {
                    add(res.dir?res.dir:'0', res.path?res.path:'', res.label, maxQueuePosition);
                });
            };

            if (torrentServerService.supports.getDownloadDirectories === true) {
                torrentServerService.getDownloadDirectories().then(openAddDialog);
            } else {
                openAddDialog([]);
            }

        };

        $scope.addTorrentFilesChanged = function(files, event, rejectedFiles) {
            var rejected = 0;
            var rejectedFilesNamesStr = '';
            var i;
            if (rejectedFiles && rejectedFiles.length > 0) {
                for (i = 0; i < rejectedFiles.length; i++) {
                    rejected++;
                    rejectedFilesNamesStr += '<br/>' + rejectedFiles[i].name;
                }
            }
            for (i = 0; i < files.length; i++) {
                if (files[i].name.search(/^.*\.torrent$/i) === -1) {
                    rejected++;
                    rejectedFilesNamesStr += '<br/>' + files[i].name;
                    files.splice(i, 1);
                    i--;
                }
            }
            if (rejected > 0) {
                toastr.warning(rejected + ' files ignored (not .torrent files): ' + rejectedFilesNamesStr, null, {
                    timeOut: 5000
                });
            }
        };


      /**
       *
       * @param orderByQueuePosition
       * @param orderByReverse
       * @returns {Array<Torrent>}
       */
        function getSelectedTorrents(orderByQueuePosition, orderByReverse) {
          var items = $scope.selectedtorrents;
          if (orderByQueuePosition) {
            items = $filter('orderBy')(items, 'torrentQueueOrder', orderByReverse);
          }
          return items;
        }

        function getSelectedHashes(item, orderByQueuePosition, orderByReverse) {
            var hashes = [];
            if (!item) {
              var items = getSelectedTorrents(orderByQueuePosition, orderByReverse);
              angular.forEach(items, function(value /* , key */ ) {
                  hashes.push(value.hash);
              });
            } else {
                hashes.push(item.hash);
            }

            return hashes;
        }

        $scope.doAction = function(action, item, callback) {
            var hashes = getSelectedHashes(item);

            if (action === 'info') {
                $scope.showDetails(item);
                return;
            }

            if (action === 'star') {
                $scope.showStar(item.isStarred ? '' : item.decodedName, $scope.starredItems);
                return;
            }

            var service;

            if (action === 'removeDefault') {
                service = torrentServerService.removeTorrent();
            } else {
                service = torrentServerService.actions()[action];
            }

            if (service) {
                var ts = service({
                    hash: hashes
                });
                ts.$promise.then(function() {
                    if(callback) {
                        callback();
                    }
                });
                return ts;
            } else {
                toastr.warning('Action ' + action + ' not yet supported', null, {
                    timeOut: 1000
                });
            }
        };

      /**
       *
       * @param service
       * @param hashChunk
       * @param action
       * @param delta
       * @param counts {
       *    {
       *        chunks: LoopCounter,
       *        chunk: Range
       *    }
       * }
       * @returns {Function}
       */
        var executeQueueMoveFactory = function(service, hashChunk, action, delta, counts) {
        return function() {
          var hashChunkStart = j * $scope.queueMovement.maxRequestSize;
          console.debug(action + ": Executing Queue Move: Delta=" + delta + "; Chunk #" + (j + 1) + "/" + hashChunks + ": " + (hashChunkStart + 1) + "/" + (hashChunkStart + hashChunk.length), hashChunk );
          for (var i=0;i<delta; i++) {
            var ts = service({
              hash: hashChunk
            });
            //debugger;
            var execute = function (step) {
              ts.$promise.then(function (a) {
                console.debug(action + ": Executed Step #" + step + "/" + delta);
                // debugger;
              });
            };
            execute(i + 1);
          }
          //console.debug(action + ": # Executed  Steps: " + delta + "; Chunk #" + (j + 1) + "/" + hashChunks + ": " + (hashChunkStart + 1) + "/" + (hashChunkStart + hashChunk.length));
        };
      };

        $scope.updateQueueMovement = function() {
          saveCookie(ntuConst.lastQueueMovement, $scope.queueMovement);
        };

        $scope.doMove = function(isQueueDown, offset) {
          var i, j;
          var action = isQueueDown ? 'queuedown' : 'queueup',
              orderByReverse = action == 'queuedown' || action == 'queuetop',
              isRelativeDelta = $scope.queueMovement.useCustomDelta && $scope.queueMovement.isRelative,
              delta = Number($scope.queueMovement.useCustomDelta ? $scope.queueMovement.delta : 1),
              items = getSelectedTorrents(true, orderByReverse);
          if (Number.isNaN(delta)) {
            delta = 1;
          }
          var relativeDelta = 0,
              relativeDeltaAdj = delta;
          offset = Number(offset);
          if (Number.isNaN(offset)) {
            offset = 0;
          }
          if (offset > 0) {
            if (isQueueDown) {
              items.splice(offset);
            } else {
              items.splice(0, offset);
            }
          }
          if (isRelativeDelta) {
            if (items.length) {
              var item = items[isQueueDown ? items.length -1 : 0];
              delta = Math.abs(item.torrentQueueOrder - delta);
              delta += (isQueueDown ? -1 : -1);
              var lastNumber = item.torrentQueueOrder-1;
              for (i=0,j=items.length;i<j;i++) {
                if (items[i].torrentQueueOrder != lastNumber + 1) {
                  break;
                }
                lastNumber++;
                relativeDelta ++;
              }
              if (!isQueueDown) {
                relativeDeltaAdj += relativeDelta;// * (isQueueDown ? -1 : 1);
              }
            }
          }

          var hashes = items.map(function (torrent) { return torrent.hash; });
          hashes = hashes.chunk($scope.queueMovement.maxRequestSize);
          var service = torrentServerService.actions()[action];
          var delay = 0;
          const loop = new LoopCounter(hashes);
          for (; loop.active; loop.step()) {
            var chunk = hashes[loop.index];
            var counts = {
              chunks: loop,
              chunk: new Range(loop.index * $scope.queueMovement.maxRequestSize + 1, chunk)
            };
            console.debug("Queuing Move for Chunk #"
              + counts.chunks.current
              + (delay ? " in " + delay + " ms" : "")
              + " for Hashes "
              + counts.chunk.start + "-" + counts.chunk.end);
            setTimeout(executeQueueMoveFactory(service, chunk, action, delta, angular.copy(counts)), delay);
            delay += delta * (counts.chunks.current < counts.chunks.total ? 100 : 50);
          }
          console.debug("Queuing Recursive Move in " + delay + " ms");
          setTimeout(function() {
            if (isRelativeDelta) {
              $scope.queueMovement.delta = relativeDeltaAdj;
              $scope.updateQueueMovement();
              //items.splice(0, relativeDelta);
              //$scope.selectedtorrents.splice(0, relativeDelta);
            }
            $scope.reload(true);
            if (isRelativeDelta && $scope.queueMovement.recurseIfRelative && items.length > relativeDelta) {
              delay += 5000;
              console.debug("Recursively moving " + items.length + " torrents in " + delay + "ms");
              //debugger;
              setTimeout(function () { $scope.doMove(isQueueDown, offset + relativeDelta); }, delay);
            }
            else {
              console.debug("Reloaded queue after Queue Move");
            }
          }, delay);
        };

        $scope.setLabel = function(value, item) {
            var hashes = getSelectedHashes(item);

            var service = torrentServerService.setLabel;
            $scope.labelToSet = '';

            if (service) {
                var ts = service(hashes, value);
                ts.success(function() {
                    if (value === '') {
                        toastr.info('Label removed', null, {
                            timeOut: 2500
                        });
                    } else {
                        toastr.info('Label set to "' + value + '"', null, {
                            timeOut: 2500
                        });
                    }
                });
                return ts;
            } else {
                toastr.warning('Setting label not supported', null, {
                    timeOut: 1000
                });
            }
        };

        $scope.setNewLabel = function(item) {

            var modalInstance = $uibModal.open({
                templateUrl: 'newLabelModal.html',
                backdrop: true
            });

            modalInstance.result.then(function(newLabel) {
                return $scope.setLabel(newLabel, item);
            }, function() {

            });

        };

        $scope.showStar = function(name, currentStarred) {
            var modalInstance = $uibModal.open({
                controller: ['$scope', function($scope) {
                    $scope.starredItems = currentStarred;
                    $scope.newStarred = name;
                }],
                templateUrl: 'starredModal.html',
                backdrop: true
            });

            modalInstance.result.then(function(starredItems) {
                saveCookie(ntuConst.starredItems, starredItems);
                $scope.starredItems = starredItems;
            }, function() {

            });

        };

        $scope.searchSimilar = function(torrent) {
            var filter = '';
            var fuzzy = false;
            var starredName = $scope.starredNamesStrings[torrent.decodedName];

            if (starredName && $scope.filters.name !== starredName) {
                filter = starredName;
                fuzzy = false;
            } else if (!starredName && $scope.filters.name !== torrent.cleanedName){
                filter = torrent.cleanedName;
                fuzzy = true;
            }

            $scope.filters.name = filter;
            $scope.filters.fuzzy = fuzzy;
            $scope.doFilter();
        };
        $scope.showActions = function(torrent) {
            var $parentScope = $scope;
            var modalInstance = $uibModal.open({
                controller: ['$scope', function($scope) {
                    $scope.item = torrent;
                    $scope.starredNamesStrings = $parentScope.starredNamesStrings;
                    $scope.doAction = function(action,torrent) {
                        $parentScope.doAction(action,torrent,function() {
                            $scope.$close();
                        });
                    };
                    $scope.search = function(torrent) {
                      $parentScope.searchSimilar(torrent);
                      $scope.$close();
                    };

                }],
                windowClass: 'actionsModal',
                backdropClass: 'gray-background',
                templateUrl: 'actionsModal.html',
                backdrop: true
            });

            console.log(modalInstance);
        };

        $scope.emptyFilters = {
            name: '',
            label: undefined,
            l33t: true,
            selected: false,
            status: '',
            fuzzy: false
        };

        if ($cookies.get(ntuConst.lastFilters)) {
            $scope.filters = loadCookie(ntuConst.lastFilters);
        } else {
            $scope.filters = angular.copy($scope.emptyFilters);
        }

        if ($cookies.get(ntuConst.lastSorter)) {
            $scope.sorter = loadCookie(ntuConst.lastSorter);
        } else {
            $scope.sorter = {
                field: 'torrentQueueOrder',
                secondField: 'name',
                ascending: true
            };
        }

        $scope.doSort = function() {
            $log.info('sorting');
            var compareFunc = function(aVal, bVal) {
                if (aVal === bVal) {
                    return 0;
                } else if (aVal > bVal) {
                    return 1;
                } else {
                    return -1;
                }
            };

            var sortFunc = function(a, b) {
                var aVal = a;
                var bVal = b;
                var tmp;
                var aField, bField;

                if (aVal === bVal) {
                    return 0;
                }
                if ($scope.sorter.ascending) {
                    tmp = bVal;
                    bVal = aVal;
                    aVal = tmp;
                }

                if (typeof aVal[$scope.sorter.field] === 'function') {
                    aField = aVal[$scope.sorter.field]();
                    bField = bVal[$scope.sorter.field]();
                } else {
                    aField = aVal[$scope.sorter.field];
                    bField = bVal[$scope.sorter.field];
                }

                if (aField === bField) {
                    var aSecondField = a[$scope.sorter.secondField];
                    var bSecondField = b[$scope.sorter.secondField];

                    if (aSecondField !== bSecondField) {
                        if ($scope.sorter.ascending) {
                            return compareFunc(aSecondField, bSecondField);
                        } else {
                            return compareFunc(bSecondField, aSecondField);
                        }
                    } else {
                        return 0;
                    }
                } else {
                    return compareFunc(aField, bField);
                }
            };
            $scope.filteredtorrents = $scope.filteredtorrents.sort(sortFunc);
            saveCookie(ntuConst.lastSorter,$scope.sorter);
        };

        $scope.sortBy = function(field) {
            if ($scope.sorter.field === field) {
                $scope.sorter.ascending = !$scope.sorter.ascending;
            } else {
                $scope.sorter.field = field;
            }
            $scope.doSort();
        };

        var doFilterTimer;
        $scope.notL33table = false;
        $scope.clearFilters = function() {
            $scope.filters = angular.copy($scope.emptyFilters);
            $scope.doFilter();
        };
        $scope.doFilter = function(wait) {

            $scope.notL33table = $scope.filters.name.search(/^[a-z0-9 ]+$/i) === -1;

            $timeout.cancel(doFilterTimer);
            var doFilter = function() {
                $log.info('filtering');
                var filters = {};
                var i, c, l;

                if ($scope.filters.label === null) {
                    delete filters.label;
                } else {
                    filters.label = $scope.filters.label;
                }

                if ($scope.filters.status === null) {
                    delete filters.status;
                } else {
                    filters.status = $scope.filters.status;
                }

                filters.selected = $scope.filters.selected;
                filters.fuzzy = $scope.filters.fuzzy;

                if ($scope.filters.name === null || $scope.filters.name === '') {
                    delete filters.name;
                } else {
                    var name = $scope.filters.name.split(' ').join('.');
                    filters.name = name;

                    if (!$scope.notL33table && $scope.filters.l33t === true) {
                        var leetedName = '';
                        for (i = 0; i < name.length; i++) {
                            c = name.charAt(i);
                            l = $window.L33t.Translate(c);
                            if (c === l) {
                                leetedName += c;
                            } else {
                                leetedName += '[' + c + l + ']';
                            }

                        }
                        filters.name = leetedName;
                    }
                }

                $scope.filteredtorrents = $filter('filter')($scope.torrents,
                    function(torrent /*, index */ ) {
                        var matches = true;
                        if (typeof filters.label !== 'undefined') {
                            matches &= torrent.label === filters.label;
                        }
                        if (filters.selected) {
                            matches &= torrent.selected === true;
                        }
                        if (filters.status) {
                            switch (filters.status) {
                                case 'completed':
                                    {
                                        matches &= torrent.isStatusCompleted();
                                        break;
                                    }
                                case 'downloading':
                                    {
                                        matches &= torrent.isStatusDownloading();
                                        break;
                                    }
                                case 'paused':
                                    {
                                        matches &= torrent.isStatusPaused();
                                        break;
                                    }
                                case 'stopped':
                                    {
                                        matches &= torrent.isStatusStopped();
                                        break;
                                    }
                                case 'queued':
                                    {
                                        matches &= torrent.isStatusQueued();
                                        break;
                                    }
                                case 'incomplete':
                                    {
                                        matches &= torrent.isStatusIncomplete();
                                        break;
                                    }
                                case 'seeding':
                                    {
                                        matches &= torrent.isStatusSeeding();
                                        break;
                                    }
                                case 'error':
                                    {
                                        matches &= torrent.isStatusError();
                                        break;
                                    }
                            }
                        }
                        if (matches && filters.name && filters.name !== '') {
                          var nameRegex = new RegExp(filters.name, 'i');
                          var doFilterName = function (name) {
                            return (name.search(nameRegex) > -1);
                          };
                          matches = doFilterName(torrent.name) || doFilterName(torrent.label);
                          if (!matches && filters.fuzzy) {
                              name = torrent.decodedName;
                              var subStrscore = name.subCompare($scope.filters.name);
                              matches = (subStrscore.found === 1);
                          }
                        }
                        return matches;
                    }
                );
                saveCookie(ntuConst.lastFilters,$scope.filters);
                //Filtering does not preserve order
                $scope.doSort();
            };

            if (wait === true) {
                doFilterTimer = $timeout(doFilter, 500);
            } else {
                doFilter();
            }
        };

        $scope.starredNamesStrings = {};
        var starredNamesStrings = $scope.starredNamesStrings;

        var isStarred = function(name) {
            var array = $scope.starredItems;
            if (array) {
                for (var i = 0; i < array.length; i++) {
                    if (name.indexOf(array[i].text) !== -1) {
                        starredNamesStrings[name] = array[i].text;
                        return true;
                    }
                }
            }
            delete starredNamesStrings[name];
            return false;
        };

        $scope.updateAutoReload = function() {
          saveOptions();
          $scope.reload();
        };

        $scope.reload = function(manual) {
            if ($scope.refreshing) {
                return;
            }

            $scope.refreshing = true;
            $timeout.cancel(reloadTimeout);
            $log.info('reload torrents');
            var ts = torrentServerService.torrents();

            ts.then(function(torrents) {
                var changed = false;
                var i, j, torrent;
                $scope.labels = torrents.labels;
                updateLabelColorsMap($scope.labels);

                if (torrentsMap === null) {
                    torrentsMap = {};
                }

                if (torrents.all && torrents.all.length > 0) {
                    changed = true;
                    $log.debug('"torrents.all" key with ' + torrents.all.length + ' elements');
                    var newTorrentsMap = {};

                    for (i = 0; i < torrents.all.length; i++) {
                        torrent = torrentServerService.build(torrents.all[i]);
                        if (torrentsMap[torrent.hash]) {
                            torrent.selected = torrentsMap[torrent.hash].selected;
                            torrent.files = torrentsMap[torrent.hash].files;
                        }
                        newTorrentsMap[torrent.hash] = torrent;
                    }
                    torrentsMap = newTorrentsMap;
                }

                if (torrents.changed && torrents.changed.length > 0) {
                    changed = true;
                    $log.debug('"torrentp" key with ' + torrents.changed.length + ' elements');
                    var applyLabel = labelarrayfornewtorrents.length > 0;
                    var labelToAddIndex;
                    for (i = 0; i < torrents.changed.length; i++) {
                        torrent = torrentServerService.build(torrents.changed[i]);
                        if (torrentsMap[torrent.hash]) {
                            torrent.selected = torrentsMap[torrent.hash].selected;
                            torrent.files = torrentsMap[torrent.hash].files;
                        }
                        torrentsMap[torrent.hash] = torrent;
                        if (applyLabel) {
                            if (torrent.getMainLabel() === '' && torrent.torrentQueueOrder > labelarrayfornewtorrents[0].minQueue) {
                                labelToAddIndex = undefined;
                                for (j=labelarrayfornewtorrents.length-1;j>-1; j--) {
                                    if (torrent.torrentQueueOrder > labelarrayfornewtorrents[j].minQueue) {
                                        labelToAddIndex = j;
                                    }
                                }
                                var labelToAdd = labelarrayfornewtorrents[labelToAddIndex].label;
                                labelarrayfornewtorrents.splice(labelToAddIndex, 1);
                                $scope.setLabel(labelToAdd,torrent);
                            }
                        }
                    }
                }

                if (torrents.deleted && torrents.deleted.length > 0) {
                    changed = true;
                    $log.debug('"torrentm" key with ' + torrents.deleted.length + ' elements');
                    for (i = 0; i < torrents.deleted.length; i++) {
                        delete torrentsMap[torrents.deleted[i]];
                    }
                }

                if (changed) {
                    $scope.torrents = [];
                    var currentMaxQueue = 0;
                    angular.forEach(torrentsMap, function(torrent /* , key */ ) {
                        torrent.isStarred = isStarred(torrent.decodedName);
                        $scope.torrents.push(torrent);
                        currentMaxQueue = Math.max(currentMaxQueue,torrent.torrentQueueOrder);
                    });
                    maxQueuePosition = currentMaxQueue;
                    $scope.doFilter();
                    Torrent.cache = torrentsMap;
                    $scope.selectedtorrents = getSelectedAndUpdateGlobals($scope.torrents);
                } else {
                    $log.debug('no changes');
                }
                //toastr.info('Refreshing done!',null,{timeOut: 1500});
                //toastr.clear(reloadingMsg);

                if (manual !== true && $scope.options.autoReload.enabled === true && $scope.options.autoReload.timeout > -1) {
                    reloadTimeout = $timeout($scope.reload, $scope.options.autoReload.timeout);
                }
                $scope.torrentsMap = torrentsMap;
                updateTorrentDetails($scope.lastTorrentDetails);

                var numOfLabeledTorrents = 0;
                angular.forEach($scope.labels, function(value /* , key */ ) {
                    numOfLabeledTorrents = numOfLabeledTorrents + value[1];
                });

                $scope.labels.unshift(['', $scope.torrents.length - numOfLabeledTorrents]);


                $scope.refreshing = false;

            }, function() {
                $scope.refreshing = false;
                toastr.error('Cannot load torrents', null, {
                    timeOut: 30000
                });
            });
        };

        var updateTorrentDetails = function(torrent) {
            if (torrent) {
                $scope.doAction('getprops', torrent).$promise.then(function(res) {
                    torrent.props = res.props[0];
                });
                $scope.doAction('getfiles', torrent).$promise.then(function(res) {
                    var i;
                    var files = res.files;
                    if (torrent.files) {
                        for (i = 0; i < torrent.files.length; i++) {
                            files[i].selected = torrent.files[i].selected;
                        }
                    }
                    torrent.files = files;
                    if (torrentServerService.getFileDownloadUrl) {
                        for (i = 0; i < torrent.files.length; i++) {
                            torrent.files[i].url = torrentServerService.getFileDownloadUrl(torrent,torrent.files[i]);
                        }
                    }
                });
            }
        };

        $scope.showSearch = function() {
            var modalInstance = $uibModal.open({
                templateUrl: 'views/yts-movies.html',
                controller: 'YtsMoviesCtrl',
                windowClass: 'modal-search',
                backdrop: true,
                resolve: {
                    addTorrent: function() {
                        return $scope.addTorrent;
                    }
                }
            });

            modalInstance.result.then(function() {

            }, function() {
                $scope.lastTorrentDetails = null;
            });
        };

        $scope.showDetails = function(item) {
            $scope.lastTorrentDetails = item;
            updateTorrentDetails(item);
            var modalInstance = $uibModal.open({
                templateUrl: 'views/details-dialog.html',
                controller: 'DetailsDialogCtrl',
                windowClass: 'modal-details',
                backdrop: true,
                resolve: {
                    torrent: function() {
                        return $scope.lastTorrentDetails;
                    }
                }
            });

            modalInstance.result.then(function() {

            }, function() {
                var i;
                for (i = 0; i < item.files.length; i++) {
                    item.files[i].selected = false;
                }
                $scope.lastTorrentDetails = null;
            });
        };

        $scope.updateSelected = function() {
            $scope.selectedtorrents = getSelectedAndUpdateGlobals($scope.torrents);
        };

        $scope.lastSelectedHash = null;

        $scope.setSelected = function(hash, event, forceShift) {
            $log.info('setSelected', hash);
            var ctrl = event.ctrlKey || event.metaKey;
            var shift = event.shiftKey || forceShift;
            var i, j = 0;

            if (shift) {
                var selIndex = -1;
                var lastSelIndex = -1;
                for (i = 0; i < $scope.filteredtorrents.length; i++) {
                    if (selIndex === -1 && $scope.filteredtorrents[i].hash === hash) {
                        selIndex = i;
                    }
                    if (lastSelIndex === -1 && $scope.filteredtorrents[i].hash === $scope.lastSelectedHash) {
                        lastSelIndex = i;
                    }
                    if (selIndex !== -1 && lastSelIndex !== -1) {
                        break;
                    }
                }

                if (selIndex === lastSelIndex) {
                    return;
                }

                if (lastSelIndex === -1) {
                    lastSelIndex = 0;
                }

                if (selIndex > lastSelIndex) {
                    j = selIndex + 1;
                    i = lastSelIndex;
                } else {
                    j = lastSelIndex + 1;
                    i = selIndex;
                }

                for (; i < j; i++) {
                    $scope.filteredtorrents[i].selected = true;
                }
            } else if (ctrl) {
                for (i = 0; i < $scope.torrents.length; i++) {
                    if (($scope.torrents[i].hash === hash)) {
                        $scope.torrents[i].selected = !$scope.torrents[i].selected;
                    }
                }
            } else {
                for (i = 0; i < $scope.torrents.length; i++) {
                    var same = ($scope.torrents[i].hash === hash);
                    $scope.torrents[i].selected = same;
                }
            }
            $scope.lastSelectedHash = hash;
            (function() {
                var selection = ('getSelection' in $window) ? $window.getSelection() : ('selection' in $window.document) ? $window.document.selection : null;
                if ('removeAllRanges' in selection) {
                    selection.removeAllRanges();
                } else if ('empty' in selection) {
                    selection.empty();
                }
            })();
            $scope.updateSelected();
        };

        $scope.selectCheckbox = false;

        $scope.clearSelected = function() {
            var i;
            for (i = 0; i < $scope.selectedtorrents.length; i++) {
                $scope.selectedtorrents[i].selected = false;
            }
            $scope.updateSelected();
        };

        $scope.$watch('selectCheckbox', function(isChecked) {
            var i;
            for (i = 0; i < $scope.filteredtorrents.length; i++) {
                $scope.filteredtorrents[i].selected = isChecked;
            }
            $scope.updateSelected();
        });

        $scope.$on('$destroy', function() {});

        torrentServerService.init().then(function() {
            $scope.reload();
        }, function() {
            $log.error('error', arguments);
        });

        $scope.$on('$routeChangeStart', function( /* scope, next, current */ ) {
            //Prevent multiple reload timers when switching tabs
            $timeout.cancel(reloadTimeout);
        });
    });
