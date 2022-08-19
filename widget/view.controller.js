/* Copyright start
  Copyright (C) 2008 - 2022 Fortinet Inc.
  All rights reserved.
  FORTINET CONFIDENTIAL & FORTINET PROPRIETARY SOURCE CODE
  Copyright end */
'use strict';

/* jshint camelcase: false */

(function () {
  angular.module('cybersponse')
    .controller('socManagement100Ctrl', socManagement100Ctrl);

  socManagement100Ctrl.$inject = ['$scope', 'config', '$q', 'Query', '_', 'playbookService', '$filter',
    'currentDateMinusService', '$rootScope', 'socManagementService', 'ALL_RECORDS_SIZE','$state','$window'];

  function socManagement100Ctrl($scope, config, $q, Query, _, playbookService, $filter, currentDateMinusService, $rootScope, socManagementService, ALL_RECORDS_SIZE, $state, $window) {

    var loadedSVGDocument;
    $scope.percentageData = [];
    var configLoaded = false;
    var svgLoaded = false;
    var overflowStyle = 'display: inline-block;text-overflow:ellipsis;white-space: nowrap;overflow: hidden;width: 120px;opacity: 0.8;';
    var fontFamily = '\'Lato\', sans-serif';
    var noRecordStyle = 'margin-top: 10px;margin-left: 15px;color: red;';

    function _init() {
      $scope.currentTheme = $rootScope.theme.id;
      $scope.textColor = $scope.currentTheme === 'light' ? '#000000' : '#FFFFFF';
      $scope.hoverColor = $scope.currentTheme === 'light' ? '#000000' : '#36b9b0';
      $scope.socResult = {};
      checkForSVGLoad();
      socManagementService.getConfig().then(function (response) {
        $scope.config = angular.extend(response.data, config);
        configLoaded = true;
        initializeData();
      });
    }

    function initializeData() {
      if (configLoaded && svgLoaded) {
        $scope.dateFilterField = $scope.config.timeRange || 'createDate';
        getResult();
      }
    }

    function checkForSVGLoad() {
      document.getElementById('socSvgBackground').addEventListener('load', function () {
        loadedSVGDocument = this.getSVGDocument();
        svgLoaded = true;
        initializeData();
      });
    }

    function addForeignObject(element) {
      var source = loadedSVGDocument.getElementById(element.id);
      source.setAttribute('style', 'font-family:' + fontFamily + ';');
      let bbox = source.getBBox();
      let x = bbox.x + 10;
      let y = bbox.y + 30;
      let width = bbox.width - 10;
      let height = bbox.height - 30;

      let textElem = document.createElementNS(source.namespaceURI, 'foreignObject');
      textElem.setAttribute('x', x);
      textElem.setAttribute('y', y);
      textElem.setAttribute('width', width);
      textElem.setAttribute('height', height);

      var mainDiv = document.createElement('div');
      mainDiv.setAttribute('class', element.id);
      mainDiv.setAttribute('style', 'color:' + $scope.textColor + '; font-size: 1em; font-family:' + fontFamily + ';');
      mainDiv.innerHTML = '<span>' + element.title + '</span>'; // add section tiile
      if (element.data) { // add section data if present
        var iriCount = 0;
        var mainTable = document.createElement('table');
        mainTable.setAttribute('style', 'width: 100%;margin-top:5px;font-weight:lighter;');
        for (let [key, value] of Object.entries(element.data)) {
          var _row = document.createElement('tr');
          var _col1 = document.createElement('td');
          _col1.innerHTML = key;
          _col1.setAttribute('title', key);
          var _col2 = document.createElement('td');
          _col2.innerHTML = value;
          if(element.id === 'idAutomationCalculation'){
            _col1.setAttribute('style', overflowStyle + 'cursor:pointer;color:'+ $scope.hoverColor +';text-decoration:underline');
            _row.appendChild(_col1);
            _col1.addEventListener('click', function() {
              var state = 'main.playbookDetail';
              var params = {
                id: $filter('getEndPathName')(element.template_iri[iriCount])
              };
              var url = $state.href(state, params);
              $window.open(url, '_blank');
              iriCount++;
            });
          }
          else{
            _col1.setAttribute('style', overflowStyle);
            _row.appendChild(_col1);
          }
          _row.appendChild(_col2);
          _col2.setAttribute('style', 'opacity:0.8;text-align:left;');
          mainTable.appendChild(_row);
        }
        mainDiv.appendChild(mainTable);
      }
      else{
        var infoDiv = document.createElement('div');
        infoDiv.innerHTML = 'No records';
        infoDiv.setAttribute('style', noRecordStyle);
        mainDiv.appendChild(infoDiv);
      }
      textElem.appendChild(mainDiv);
      source.after(textElem);
    }

    function addLabelCounts(element) {
      var source = loadedSVGDocument.getElementById(element.id);
      source.setAttribute('style', 'font-family:\'Lato\', sans-serif;');
      let bbox = source.getBBox();
      let x = bbox.x;
      let y = bbox.y;
      let width = 300;
      let height = bbox.height + 100;
      if(element.id === 'idTruePositiveLabel'){
        y = bbox.y - 27;
      }
      let labelElem = document.createElementNS(source.namespaceURI, 'foreignObject');
      labelElem.setAttribute('x', x);
      labelElem.setAttribute('y', y);
      labelElem.setAttribute('width', width);
      labelElem.setAttribute('height', height);

      var countDiv = document.createElement('div');
      countDiv.setAttribute('class', element.id);
      if ($scope.currentTheme === 'light') {
        countDiv.setAttribute('style', 'color: ' + $scope.textColor + '; font-size: 40px;font-family:' + fontFamily + ';');
      }
      else {
        countDiv.setAttribute('style', 'color: ' + $scope.textColor + '; font-size: 40px;font-family:' + fontFamily + ';');
      }
      countDiv.innerHTML = element.count +'<span style="font-size:25px;margin-left: 5px;">' + element.title +'</span>';
      labelElem.appendChild(countDiv);
      source.after(labelElem);
    }

    function addBlockData(element) {
      var source = loadedSVGDocument.getElementById(element.id);
      var sourceLabel = loadedSVGDocument.getElementById(element.id + 'Label');

      sourceLabel.setAttribute('style', 'font-family:\'Lato\', sans-serif;');
      let bbox = source.getBBox();
      let x = bbox.x;
      let y = bbox.y;
      let width = bbox.width;
      let height = 100;

      let labelElem = document.createElementNS(source.namespaceURI, 'foreignObject');
      labelElem.setAttribute('x', x);
      labelElem.setAttribute('y', y);
      labelElem.setAttribute('width', width);
      labelElem.setAttribute('height', height);

      var countDiv = document.createElement('div');
      countDiv.setAttribute('class', element.id);
      if ($scope.currentTheme === 'light') {
        countDiv.setAttribute('style', 'color:' + $scope.textColor + '; font-size: 40px;text-align: center;font-family:' + fontFamily + ';');
      }
      else {
        countDiv.setAttribute('style', 'color: ' + $scope.textColor + '; font-size: 40px;text-align: center;font-family:' + fontFamily + ';');
      }
      countDiv.innerHTML = element.count +' <div style="font-size:20px">' + element.title +'</div>';
      labelElem.appendChild(countDiv);
      source.after(labelElem);
    }

    function calculatePercentage(element) {
      if (element.currentValue > 0) {
        var _percent = ((element.lastValue - element.currentValue) / element.currentValue) * 100;
        element.percentChange = _percent;
        if (_percent < 0) {
          element.percentChange = Math.abs(_percent);
          element.increase = true;
        }
        else {
          element.increase = false;
        }
      }
      else if (element.lastValue === 0 && element.currentValue === 0) {
        element.percentChange = 0;
      }
      $scope.percentageData.push(element);
      $scope.percentageData.sort((a, b) => a.sequence - b.sequence);
    }

    function calculateRatio() {
      var num_1 = $scope.socResult.totalAlerts;
      var num_2 = $scope.socResult.totalIncidents;
      var num = num_2;
      for (num_2; num > 1; num--) {
        if ((num_1 % num) === 0 && (num_2 % num) === 0) {
          num_1 = num_1 / num;
          num_2 = num_2 / num;
        }
      }
      var ratio = $filter('numberToDisplay')(num_1) + ':' + $filter('numberToDisplay')(num_2);
      return ratio;
    }

    function formulateRatio(ratio) {
      var result = 0;
      var ratio1 = ratio.split(':')[0];
      var ratio2 = ratio.split(':')[1];
      if(Number(ratio2) !== 0){
        result = Number(ratio1) / Number(ratio2);
      }
      return result;
    }

    function sortObjectByKeys(object) {
      var sortable = [];
      for (var o in object) {
        sortable.push([o, object[o]]);
      }
    
      sortable.sort(function(a, b) {
          return b[1] - a[1];
      });

      let objSorted = {};
      sortable.forEach(function(item){
          objSorted[item[0]]= item[1] > 1 ? item[1] + ' times' : item[1] + ' time';
      });
      return objSorted;
    }

    //Query functions
    function getAlertSources() {
      var queryObject = {
        sort: [{
          field: 'source',
          direction: 'DESC'
        }],
        aggregates: [
          {
            'operator': 'countdistinct',
            'field': '*',
            'alias': 'total'
          },
          {
            'alias': 'source',
            'field': 'source',
            'operator': 'groupby'
          }
        ],
        filters: [
          {
            'field': $scope.dateFilterField,
            'operator': 'gte',
            'value': 'currentDateMinus(' + $scope.config.days + ')',
            'type': 'datetime'
          },
          {
            'field': $scope.dateFilterField,
            'operator': 'lte',
            'value': 'currentDateMinus(0)',
            'type': 'datetime'
          }
        ],
        'limit': 3,
        'logic': 'AND',
        '__selectFields': ['source']
      };
      var _queryObj = new Query(queryObject);
      socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
        var _dataSource = null;
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.alertSources = result['hydra:member'];
          _dataSource = {};
          if ($scope.socResult.alertSources.length > 0) {
            $scope.socResult.alertSources.forEach(element => {
              if (element.source !== null) {
                _dataSource[element.source] = element.total;
              }
            });
          }
        }
        addForeignObject({ 'id': 'idIncomingAlertSources', 'title': $scope.config.alertSource.title, 'data': _dataSource });
      });
    }

    function getAutomationCalculation() {
      var _fromDate = currentDateMinusService($scope.config.days);
      var queryObject = {
        sort: [{
          'field': 'total',
          'direction': 'DESC'
        }],
        'limit': 3,
        'filters': [{
          'field': 'tags',
          'operator': 'ncontains',
          'value': 'system'
        }, {
          'field': 'modified',
          'operator': 'gte',
          'value': $filter('date')(_fromDate, 'yyyy-MM-dd HH:mm', 'UTC')
        }],
        'logic': 'AND',
        'aggregates': [{
          'field': 'template_iri',
          'operator': 'count'
        }]
      };
      socManagementService.getPlaybookRun(queryObject).then(function (result) {
        $scope.socResult.playbookSource = result.data;
        var _dataSource = null;
        var _iri = [];
        var promises = [];
        if ($scope.socResult.playbookSource.length > 0) {
          _dataSource = {};
          $scope.socResult.playbookSource.forEach(element => {
            if (element.template_iri !== null) {
              promises.push(socManagementService.getIriElement(element.template_iri).then(function (result) {
                _dataSource[result.data.name] = element.total;
              }));
              _iri.push(element.template_iri);
            }
          });
          $q.all(promises).then(function () {
            var sortedDataSource = sortObjectByKeys(_dataSource);
            addForeignObject({ 'id': 'idAutomationCalculation', 'title': $scope.config.top3PlaybookRun.title, 'data': sortedDataSource , 'template_iri': _iri });
          });
        }
        else{
          _dataSource = null;
          addForeignObject({ 'id': 'idAutomationCalculation', 'title': $scope.config.top3PlaybookRun.title, 'data': _dataSource , 'template_iri': _iri });
        }
      });
    }

    function getTop3AlertType() {
      var queryObject = {
        sort: [{
          'field': 'total',
          'direction': 'DESC'
        }],
        aggregates: [
          {
            'operator': 'countdistinct',
            'field': '*',
            'alias': 'total'
          },
          {
            'operator': 'groupby',
            'alias': 'type',
            'field': 'type.itemValue'
          }
        ],
        filters: [
          {
            'field': $scope.dateFilterField,
            'operator': 'gte',
            'value': 'currentDateMinus(' + $scope.config.days + ')',
            'type': 'datetime'
          },
          {
            'field': $scope.dateFilterField,
            'operator': 'lte',
            'value': 'currentDateMinus(0)',
            'type': 'datetime'
          }
        ],
        'limit': 3,
        'logic': 'AND',
        '__selectFields': ['type']
      };
      var _queryObj = new Query(queryObject);
      socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
        var _dataSource = null;
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.alertSources = result['hydra:member'];
          _dataSource = {};
          if ($scope.socResult.alertSources.length > 0) {
            $scope.socResult.alertSources.forEach(element => {
              if (element.type !== null) {
                _dataSource[element.type] = element.total;

              }
            });
          }
        }
        addForeignObject({ 'id': 'idTopThreeAlerts', 'title': $scope.config.topAlerts.title, 'data': _dataSource });
      });
    }

    function getTop3IncidentType() {
      var queryObject = {
        sort: [{
          'field': 'total',
          'direction': 'DESC'
        }],
        aggregates: [
          {
            'operator': 'countdistinct',
            'field': '*',
            'alias': 'total'
          },
          {
            'operator': 'groupby',
            'alias': 'category',
            'field': 'category.itemValue'
          }
        ],
        filters: [
          {
            'field': $scope.dateFilterField,
            'operator': 'gte',
            'value': 'currentDateMinus(' + $scope.config.days + ')',
            'type': 'datetime'
          },
          {
            'field': $scope.dateFilterField,
            'operator': 'lte',
            'value': 'currentDateMinus(0)',
            'type': 'datetime'
          }
        ],
        'limit': 3,
        'logic': 'AND',
        '__selectFields': ['type']
      };
      var _queryObj = new Query(queryObject);
      socManagementService.getResourceData($scope.config.relatedResource, _queryObj).then(function (result) {
        var _dataSource = null;
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          _dataSource = {};
          $scope.socResult.incidentTypes = result['hydra:member'];
          if ($scope.socResult.incidentTypes.length > 0) {
            $scope.socResult.incidentTypes.forEach(element => {
              if (element.category !== null) {
                _dataSource[element.category] = element.total;
              }
            });
          }
        }
        addForeignObject({ 'id': 'idTopThreeIncidents', 'title': $scope.config.topIncidents.title, 'data': _dataSource });
      });
    }

    //label counts

    function getAlertCount() {
      var dateRangeFilter = {
        filters: [
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + ')'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'currentDateMinus(0)'
          }
        ]
      };

      var countAggregate = {
        alias: 'alerts',
        field: 'name',
        operator: 'count'
      };
      var _query = {
        filters: [dateRangeFilter],
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _queryObj = new Query(_query);

      var previousDateRangeFilter = {
        filters: [
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + $scope.config.days + ')'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + ')'
          }
        ]
      };

      var _previousQuery = {
        filters: [previousDateRangeFilter],
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _queryObjPreviousData = new Query(_previousQuery);
      $scope.alertIncidentPromises = [];
      $scope.socResult.totalAlerts = 0;
      $scope.socResult.previousTotalAlerts = 0;

      $scope.alertIncidentPromises.push(socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.totalAlerts = result['hydra:member'][0].alerts;
        }
        addLabelCounts({ 'id': 'idAlertLabel', 'count': $filter('numberToDisplay')($scope.socResult.totalAlerts), 'title': $scope.config.alerts.title});
      }));
      $scope.alertIncidentPromises.push(socManagementService.getResourceData($scope.config.resource, _queryObjPreviousData).then(function (result) {
        $scope.socResult.previousTotalAlerts = result['hydra:member'][0].alerts;
      }));
    }

    function getClosedAlerts() {
      var picklist_name = 'AlertStatus';
      socManagementService.getStatusByPicklistName(picklist_name).then(function (response) {
        var picklist = response[0].picklists;
        var picklistId = _.findWhere(picklist, { 'itemValue': 'Closed' })['@id'];
        var queryObject = {
          sort: [],
          'limit': ALL_RECORDS_SIZE,
          'logic': 'AND',
          'filters': [
            {
              'logic': 'AND',
              filters: [
                {
                  'field': $scope.dateFilterField,
                  'operator': 'gte',
                  'value': 'currentDateMinus(' + $scope.config.days + ')',
                  'type': 'datetime'
                },
                {
                  'field': $scope.dateFilterField,
                  'operator': 'lte',
                  'value': 'currentDateMinus(0)',
                  'type': 'datetime'
                }
              ],
            },
            {
              'field': 'status',
              'value': [
                picklistId
              ],
              'display': '',
              'operator': 'in',
              'type': 'array',
              'OPERATOR_KEY': '$'
            }
          ],
          'aggregates': [{
            'field': 'status',
            'alias': 'status',
            'operator': 'count'
          }],
          '__selectFields': ['source']
        };

        var queryObjectPrevious = {
          sort: [],
          'limit': ALL_RECORDS_SIZE,
          'logic': 'AND',
          'filters': [
            {
              'logic': 'AND',
              filters: [
                {
                  'field': $scope.dateFilterField,
                  'operator': 'gte',
                  'value': 'currentDateMinus(' + $scope.config.days + $scope.config.days + ')',
                  'type': 'datetime'
                },
                {
                  'field': $scope.dateFilterField,
                  'operator': 'lte',
                  'value': 'currentDateMinus(' + $scope.config.days + ')',
                  'type': 'datetime'
                }
              ],
            },
            {
              'field': 'status',
              'value': [
                picklistId
              ],
              'display': '',
              'operator': 'in',
              'type': 'array',
              'OPERATOR_KEY': '$'
            }
          ],
          'aggregates': [{
            'field': 'status',
            'alias': 'status',
            'operator': 'count'
          }],
          '__selectFields': ['source']
        };
        var _queryObj = new Query(queryObject);
        var _queryObjPreviousData = new Query(queryObjectPrevious);


        var promises = [];
        $scope.socResult.closedAlerts = 0;
        promises.push(socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.closedAlerts = result['hydra:member'][0].status;
          }
          addLabelCounts({ 'id': 'idClosedLabel', 'count': $filter('numberToDisplay')($scope.socResult.closedAlerts), 'title': $scope.config.closed.title});
        }));
        promises.push(socManagementService.getResourceData($scope.config.resource, _queryObjPreviousData).then(function (result) {
          $scope.socResult.previousClosedAlerts = result['hydra:member'][0].status;
        }));
        $q.all(promises).then(function () {
          calculatePercentage({
            'id': 'alertResolved',
            'sequence':5,
            'title': $scope.config.alertResolved.title,
            'value': $filter('numberToDisplay')($scope.socResult.closedAlerts),
            'currentValue': $scope.socResult.closedAlerts,
            'lastValue': $scope.socResult.previousClosedAlerts
          });
        });
      });
    }


    function getTrueFalsePositiveAlerts() {
      var picklist_name2 = 'Closure Reason';
      socManagementService.getStatusByPicklistName(picklist_name2).then(function (response) {
        var picklist2 = response[0].picklists;
        var picklistId2 = _.findWhere(picklist2, { 'itemValue': 'False Positive' })['@id'];
        var queryObject = {
          sort: [],
          'limit': ALL_RECORDS_SIZE,
          'logic': 'AND',
          'filters': [
            {
              'logic': 'AND',
              filters: [
                {
                  'field': $scope.dateFilterField,
                  'operator': 'gte',
                  'value': 'currentDateMinus(' + $scope.config.days + ')',
                  'type': 'datetime'
                },
                {
                  'field': $scope.dateFilterField,
                  'operator': 'lte',
                  'value': 'currentDateMinus(0)',
                  'type': 'datetime'
                }
              ],
            },
            {
              'field': 'closureReason',
              'value': [
                picklistId2
              ],
              'display': '',
              'operator': 'in',
              'type': 'array',
              'OPERATOR_KEY': '$'
            }
          ],
          'aggregates': [{
            'field': 'status',
            'alias': 'status',
            'operator': 'count'
          }],
          '__selectFields': ['source']
        };
        var _queryObj = new Query(queryObject);
        $scope.socResult.falsePositiveAlerts = 0;
        socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.falsePositiveAlerts = result['hydra:member'][0].status;
            $scope.socResult.truePositiveAlerts = ($scope.socResult.totalAlerts - $scope.socResult.falsePositiveAlerts);
            addLabelCounts({ 'id': 'idFlasePositiveLabel', 'count': $filter('numberToDisplay')($scope.socResult.falsePositiveAlerts) ,'title': $scope.config.falsePositive.title});
            addLabelCounts({ 'id': 'idTruePositiveLabel', 'count': $filter('numberToDisplay')($scope.socResult.truePositiveAlerts) ,'title': $scope.config.truePositive.title});

          }
        });
      });

    }

    function getTotalIncidentCount() {
      var dateRangeFilter = {
        filters: [
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + ')'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'currentDateMinus(0)'
          }
        ]
      };

      var previousDateRangeFilter = {
        filters: [
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + $scope.config.days + ')'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + ')'
          }
        ]
      };

      var countAggregate = {
        alias: 'incidents',
        field: 'name',
        operator: 'count'
      };
      var _query = {
        filters: [dateRangeFilter],
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _previousQuery = {
        filters: [previousDateRangeFilter],
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE
      };
      var _queryObj = new Query(_query);
      var _previousQueryObj = new Query(_previousQuery);

      $scope.socResult.totalIncidents = 0;
      $scope.socResult.previousTotalIncidents = 0;

      $scope.alertIncidentPromises.push(socManagementService.getResourceData($scope.config.relatedResource, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.totalIncidents = result['hydra:member'][0].incidents;
        }
        addLabelCounts({ 'id': 'idIncidentsLabel', 'count': $filter('numberToDisplay')($scope.socResult.totalIncidents),'title': $scope.config.incident.title });
      }, function(){
        addLabelCounts({ 'id': 'idIncidentsLabel', 'count': $scope.socResult.totalIncidents,'title': $scope.config.incident.title });
      }));

      $scope.alertIncidentPromises.push(socManagementService.getResourceData($scope.config.relatedResource, _previousQueryObj).then(function (result) {
        $scope.socResult.previousTotalIncidents = result['hydra:member'][0].incidents;
      }));

      $q.all($scope.alertIncidentPromises).then(function () {
        var ratioCalculated = calculateRatio($scope.socResult.totalAlerts, $scope.socResult.totalIncidents);
        var previousRatioCalculated = calculateRatio($scope.socResult.previousTotalAlerts, $scope.socResult.previousTotalIncidents);

        calculatePercentage({
          'id': 'ratio',
          'sequence':1,
          'title': $scope.config.ratio.title,
          'value': ratioCalculated,
          'currentValue': formulateRatio(ratioCalculated),
          'lastValue': formulateRatio(previousRatioCalculated)
        });
      });


    }

    function getImpactCount() {
      var dateRangeFilter = {
        filters: [
          {
            field: $scope.config.relatedResource.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + ')'
          },
          {
            field: $scope.config.relatedResource.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'currentDateMinus(0)'
          },
          {
            'field': 'impactROI',
            'operator': 'isnull',
            'value': 'false'
          }
        ]
      };

      var countAggregate = {
        alias: 'impact',
        field: 'impactROI',
        operator: 'sum'
      };
      var _query = {
        filters: [dateRangeFilter],
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _queryObj = new Query(_query);
      var impactResult = 0;
      socManagementService.getResourceData($scope.config.relatedResource, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.totalImpact = result['hydra:member'][0].impact;
          impactResult = ($scope.socResult.totalImpact * $scope.config.artifacts.averageTime * $scope.config.artifacts.dollarValue) / 60;
        }
        addBlockData({ 'id': 'idImpactDivision', 'count': '$'+$filter('numberToDisplay')(impactResult),'title': $scope.config.impact.title});
      },function(){
        addBlockData({ 'id': 'idImpactDivision', 'count': '$'+$filter('numberToDisplay')(impactResult),'title': $scope.config.impact.title});
      });
    }

    function getTotalAssetsCount() {
      var dateRangeFilter = {
        filters: [
          {
            field: $scope.config.relatedResource2.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + ')'
          },
          {
            field: $scope.config.relatedResource2.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'currentDateMinus(0)'
          },
          {
            'field': 'incidents',
            'operator': 'isnull',
            'value': 'false'
          }
        ]
      };

      var countAggregate = {
        alias: 'assets',
        field: '*',
        operator: 'countdistinct'
      };
      var _query = {
        filters: [dateRangeFilter],
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _queryObj = new Query(_query);
      socManagementService.getResourceData($scope.config.relatedResource2, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.totalAssets = result['hydra:member'][0].assets;
          addBlockData({ 'id': 'idAssetsDivision', 'count': $scope.socResult.totalAssets ,'title': $scope.config.assets.title});
        }
      });
    }

    function getArtifactsAnalysed() {
      var dateRangeFilter = {
        filters: [
          {
            field: $scope.config.relatedResource3.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'currentDateMinus(' + $scope.config.days + ')'
          },
          {
            field: $scope.config.relatedResource3.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'currentDateMinus(0)'
          },
          {
            'field': 'incidents',
            'operator': 'isnull',
            'value': 'false'
          }
        ]
      };

      var countAggregate = {
        alias: 'indicators',
        field: '*',
        operator: 'countdistinct'
      };
      var _query = {
        filters: [dateRangeFilter],
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _queryObj = new Query(_query);
      socManagementService.getResourceData($scope.config.relatedResource3, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.totalArtifactsAnalysed = result['hydra:member'][0].indicators;
          var artifactsResult = ($scope.socResult.totalArtifactsAnalysed * $scope.config.artifacts.averageTime * $scope.config.artifacts.dollarValue) / 60;
          addBlockData({ 'id': 'idArtifactsDivision', 'count': $filter('numberToDisplay')(artifactsResult),'title': $scope.config.artifacts.title });
        }
      });
    }

    function getMTTRAlert() {
      var dateRangeFilter = {
        logic: 'AND',
        type: 'datetime',
        _field: $scope.dateFilterField,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,' + $scope.config.days + ', 0, 0, 0)',
        filters: [
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0,' + (-1 * $scope.config.days) + ', 0, 0, 0)'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0, 0, 0, 0, 0)'
          }
        ]
      };

      var previousDateRangeFilter = {
        logic: 'AND',
        type: 'datetime',
        _field: $scope.dateFilterField,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,'+(-1*($scope.config.days+$scope.config.days))+', 0, 0, 0)',
        filters:[
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0,'+(-1*($scope.config.days+$scope.config.days))+', 0, 0, 0)'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0,'+(-1*$scope.config.days)+', 0, 0, 0)'
          }
        ]
      };
      var queryAggregates = {
        alias: 'value',
        field: $scope.config.alertMttr.criteria+','+$scope.config.alertMttr.resolveCriteria,
        operator: 'avg'
      };
      var _query = {
        filters: [dateRangeFilter],
        aggregates: [queryAggregates],
        limit: 30
      };
      var _queryObj = new Query(_query);

      var _previousQuery = {
        filters: [previousDateRangeFilter],
        aggregates: [queryAggregates],
        limit: 30
      };
      var _previousQueryObj = new Query(_previousQuery);

      var promises = [];
      promises.push(socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
        var secondsResult = 0;
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.alertMttr = result['hydra:member'][0].value || 0;
            secondsResult = $filter('dayToSeconds')($scope.socResult.alertMttr);
          }
        }));
        promises.push(socManagementService.getResourceData($scope.config.resource, _previousQueryObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
              $scope.socResult.previousAlertMttr = result['hydra:member'][0].value || 0;
            }
          }));
        $q.all(promises).then(function () {
          calculatePercentage({
            'id': 'alertMttr',
            'sequence':7,
            'title': $scope.config.alertMttr.title,
            'value': $filter('dayToSeconds')($scope.socResult.alertMttr),
            'currentValue': $scope.socResult.alertMttr,
            'lastValue': $scope.socResult.previousAlertMttr
          });
        });       
    }

    function getMTTRIncident() {
      var dateRangeFilter = {
        logic: 'AND',
        type: 'datetime',
        _field: $scope.dateFilterField,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,' + $scope.config.days + ', 0, 0, 0)',
        filters: [
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0,' + (-1 * $scope.config.days) + ', 0, 0, 0)'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0, 0, 0, 0, 0)'
          }
        ]
      };

      var _queryFilter = {
        'field': 'status',
        'operator': 'eq',
        'value': '/api/3/picklists/bb73fd5e-f699-11e7-8c3f-9a214cf093ae',
        '_value': {
          'itemValue': 'Resolved'
        },
        'type': 'object'
      };
      var previousDateRangeFilter = {
        logic: 'AND',
        type: 'datetime',
        _field: $scope.dateFilterField,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,'+(-1*($scope.config.days+$scope.config.days))+', 0, 0, 0)',
        filters:[
          {
            field: $scope.dateFilterField,
            operator: 'gte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0,'+(-1*($scope.config.days+$scope.config.days))+', 0, 0, 0)'
          },
          {
            field: $scope.dateFilterField,
            operator: 'lte',
            type: 'primitive',
            value: 'getRelativeDate(0, 0,'+(-1*$scope.config.days)+', 0, 0, 0)'
          }
        ]
      };

      var queryAggregates = {
        alias: 'value',
        field: $scope.config.incidentMttr.criteria+','+$scope.config.incidentMttr.resolveCriteria,
        operator: 'avg'
      };
      var _query = {
        filters: [dateRangeFilter,_queryFilter],
        aggregates: [queryAggregates],
        limit: ALL_RECORDS_SIZE
      };
      var _queryObj = new Query(_query);

      var _previousQuery = {
        filters: [previousDateRangeFilter,_queryFilter],
        aggregates: [queryAggregates],
        limit: ALL_RECORDS_SIZE
      };
      var _previousQueryObj = new Query(_previousQuery);

      var promises = [];
      promises.push(socManagementService.getResourceData($scope.config.relatedResource, _queryObj).then(function (result) {
        var secondsResult = 0;
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.incidentMttr = result['hydra:member'][0].value || 0;
            secondsResult = $filter('dayToSeconds')($scope.socResult.incidentMttr);
          }
        }));
        promises.push(socManagementService.getResourceData($scope.config.relatedResource, _previousQueryObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
              $scope.socResult.previousIncidentMttr = result['hydra:member'][0].value || 0;
            }
          }));
        $q.all(promises).then(function () {
          calculatePercentage({
            'id': 'incidentMttr',
            'sequence':8,
            'title': $scope.config.incidentMttr.title,
            'value': $filter('dayToSeconds')($scope.socResult.incidentMttr),
            'currentValue': $scope.socResult.incidentMttr,
            'lastValue': $scope.socResult.previousIncidentMttr
          });
        });       
    }

    function getPlaybookRunCount() {
      var _currentDate = new Date();
      var _fromDate = currentDateMinusService($scope.config.days);
      var _pbRunQuery = {
        'modified_after': $filter('date')(_fromDate, 'yyyy-MM-dd HH:mm:ss', 'UTC'),
        'modified_before': $filter('date')(_currentDate, 'yyyy-MM-dd HH:mm:ss', 'UTC')
      };

      var _lastToDate = currentDateMinusService($scope.config.days);
      var _lastFromDate = currentDateMinusService($scope.config.days + $scope.config.days);

      var _pbLastRunQuery = {
        'modified_after': $filter('date')(_lastFromDate, 'yyyy-MM-dd HH:mm:ss', 'UTC'),
        'modified_before': $filter('date')(_lastToDate, 'yyyy-MM-dd HH:mm:ss', 'UTC')
      };
      var promises = [];
      promises.push(playbookService.getRunningPlaybooks(_pbRunQuery).then(function (response) {
        $scope.playbookRun = response['hydra:totalItems'];
      }));
      promises.push(playbookService.getRunningPlaybooks(_pbLastRunQuery).then(function (response) {
        $scope.playbookLastRun = response['hydra:totalItems'];
      }));
      $q.all(promises).then(function () {
        calculatePercentage({
          'id': 'playbookRun',
          'sequence':2,
          'title': $scope.config.playbookRun.title,
          'value': $scope.playbookRun,
          'currentValue': $scope.playbookRun,
          'lastValue': $scope.playbookLastRun
        });
      });
    }

    function getPlaybookActionCount() {
      var _query = {
        includeConfigActions: false,
        includeFailedActions: true,
        timeWindow: { 'type': 'diff', 'value': $scope.config.days }
      };

      var _lastToDate = currentDateMinusService($scope.config.days);
      var _lastFromDate = currentDateMinusService($scope.config.days + $scope.config.days);
      var _lastActionQuery = {
        'type': 'absolute',
        'startTime': $filter('date')(_lastFromDate, 'yyyy-MM-dd HH:mm:ss', 'UTC'),
        'endTime': $filter('date')(_lastToDate, 'yyyy-MM-dd HH:mm:ss', 'UTC')
      };
      var promises = [];
      var currentValue = 0;
      var previousValue = 0;
      promises.push(socManagementService.getPlaybookActionExecuted(_query).then(function (response) {
        currentValue = response.actionCount.current;
      }));
      promises.push(socManagementService.getPlaybookActionExecuted(_lastActionQuery).then(function (response) {
        previousValue = response.actionCount.current;
      }));
      $q.all(promises).then(function () {
        calculatePercentage({
          'id': 'actionExecuted',
          'sequence':3,
          'title': $scope.config.actionsExecuted.title,
          'value': currentValue,
          'currentValue': currentValue,
          'lastValue': previousValue
        });
        calculateRoi(currentValue, previousValue);
        calculateTimeSaving(currentValue, previousValue);
      });
    }

    function calculateRoi(currentValue, previousValue) {
      var _roiCurrentValue = (currentValue * $scope.config.roi.averageTime * $scope.config.roi.dollarValue) / 60;
      var _roiPreviousValue = (previousValue * $scope.config.roi.averageTime * $scope.config.roi.dollarValue) / 60;
      calculatePercentage({
        'id': 'roi',
        'sequence':4,
        'title': $scope.config.roi.title,
        'value': '$'+$filter('numberToDisplay')(_roiCurrentValue),
        'currentValue': _roiCurrentValue,
        'lastValue': _roiPreviousValue
      });
    }

    function calculateTimeSaving(currentValue, previousValue) {
      var _timeSavingCurrentValue = (currentValue * $scope.config.timeSaved.averageTime) * 60;
      var _timeSavingPreviousValue = (previousValue * $scope.config.timeSaved.averageTime) * 60;
      calculatePercentage({
        'id': 'overallTimeSaved',
        'sequence':6,
        'title': $scope.config.timeSaved.title,
        'value': (_timeSavingCurrentValue !== 0) ? secondsToString(_timeSavingCurrentValue) : 0,
        'currentValue': _timeSavingCurrentValue,
        'lastValue': _timeSavingPreviousValue
      });
    }

    function secondsToString(seconds) {
      var value = seconds;
      var units = {
        'd': 24 * 60 * 60,
        'h': 60 * 60
      };

      var result = [];
      for (var name in units) {
        var p = Math.floor(value / units[name]);
        if (p === 1) { result.push(p + name); }
        if (p >= 2) { result.push(p + name); }
        value %= units[name];
      }

      return result.toString().replace(',', ' ');
    }

    // --      queries
    function getResult() {
      getAlertSources();
      getAutomationCalculation();
      getTop3AlertType();
      getTop3IncidentType();
      getAlertCount();
      getTrueFalsePositiveAlerts();
      getClosedAlerts();
      getTotalIncidentCount();
      getImpactCount();
      getTotalAssetsCount();
      getArtifactsAnalysed();
      getPlaybookRunCount();
      getPlaybookActionCount();
      getMTTRAlert();
      getMTTRIncident();
    }

    _init();
  }
})();
