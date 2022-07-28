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
    'currentDateMinusService', '$rootScope', 'picklistsService', 'socManagementService', 'ALL_RECORDS_SIZE'];

  function socManagement100Ctrl($scope, config, $q, Query, _, playbookService, $filter, currentDateMinusService, $rootScope, picklistsService, socManagementService, ALL_RECORDS_SIZE) {

    var loadedSVGDocument;
      $scope.percentageData = [];
      var configLoaded = false;
      var svgLoaded = false;
      var overflowStyle = 'display: inline-block;text-overflow:ellipsis;white-space: nowrap;overflow: hidden;width: 120px;';
      var _textColor = $scope.currentTheme === 'light' ? '#000000' : '#FFFFFF';
      var fontFamily = '\'Lato\', sans-serif';

      function _init() {
        $scope.currentTheme = $rootScope.theme.id;
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
        source.setAttribute('style','font-family:'+fontFamily+';');
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
        mainDiv.setAttribute('style', 'color:' + _textColor + '; font-size: 1em; font-family:'+fontFamily+';');
        mainDiv.innerHTML = '<span>' + element.title + '</span>'; // add section tiile
        if (element.data) { // add section data if present
          var mainTable = document.createElement('table');
          mainTable.setAttribute('style', 'width: 100%;margin-top:2px;font-weight:lighter;');
  
          for (let [key, value] of Object.entries(element.data)) {
            var _row = document.createElement('tr');
            var _col1 = document.createElement('td');
            _col1.innerHTML = key;
            _col1.setAttribute('title', key);
            var _col2 = document.createElement('td');
            _col2.innerHTML = value;
            _row.appendChild(_col1);
            _col1.setAttribute('style', overflowStyle);
            _row.appendChild(_col2);
            mainTable.appendChild(_row);
          }
          mainDiv.appendChild(mainTable);
        }
        textElem.appendChild(mainDiv);
        source.after(textElem);
      }
  
      function addLabelCounts(element) {
        var source = loadedSVGDocument.getElementById(element.id);
        source.setAttribute('style','font-family:\'Lato\', sans-serif;');
        let bbox = source.getBBox();
        let x = bbox.x;
        if(element.id === 'idAlertLabel'){
          x = x - 30;
        }
        let y = bbox.y - 40;
        let width = 300;
        let height = bbox.height + 100;
  
        let labelElem = document.createElementNS(source.namespaceURI, 'foreignObject');
        labelElem.setAttribute('x', x);
        labelElem.setAttribute('y', y);
        labelElem.setAttribute('width', width);
        labelElem.setAttribute('height', height);
  
        var countDiv = document.createElement('div');
        countDiv.setAttribute('class', element.id);
        if ($scope.currentTheme === 'light') {
          countDiv.setAttribute('style', 'color: '+_textColor+'; font-size: 40px;font-family:'+fontFamily+';');
        }
        else {
          countDiv.setAttribute('style', 'color: '+_textColor+'; font-size: 40px;font-family:'+fontFamily+';');
        }
        countDiv.innerHTML = element.count;
        labelElem.appendChild(countDiv);
        source.after(labelElem);
      }
  
      function addBlockData(element) {
        var source = loadedSVGDocument.getElementById(element.id);
        var sourceLabel = loadedSVGDocument.getElementById(element.id+ 'Label');

        sourceLabel.setAttribute('style','font-family:\'Lato\', sans-serif;');
        let bbox = source.getBBox();
        let x = bbox.x;
        let y = bbox.y;
        let width = bbox.width;
        let height = 50;
  
        let labelElem = document.createElementNS(source.namespaceURI, 'foreignObject');
        labelElem.setAttribute('x', x);
        labelElem.setAttribute('y', y);
        labelElem.setAttribute('width', width);
        labelElem.setAttribute('height', height);
  
        var countDiv = document.createElement('div');
        countDiv.setAttribute('class', element.id);
        if ($scope.currentTheme === 'light') {
          countDiv.setAttribute('style', 'color:'+ _textColor +'; font-size: 40px;text-align: center;font-family:'+fontFamily+';');
        }
        else {
          countDiv.setAttribute('style', 'color: '+_textColor+'; font-size: 40px;text-align: center;font-family:'+fontFamily+';');
        }
        countDiv.innerHTML = element.count;
        labelElem.appendChild(countDiv);
        source.after(labelElem);
      }
  
      function calculatePercentage(element) {
          if (element.currentValue > 0) {
            var _percent = ((element.lastValue - element.currentValue) / element.currentValue) * 100;
            element.percentChange = _percent;
            if (_percent < 0) {
              element.percentChange = Math.abs(_percent);
              element.increase = false;
            }
            else {
              element.increase = true;
            }
          }
          else if(element.lastValue === 0 && element.currentValue === 0){
            element.percentChange = 0;
          }
          $scope.percentageData.push(element);
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
        var ratio = num_1 + ':' + num_2;
        return ratio;
      }

      function formulateRatio(ratio){
        var ratio1 = ratio.split(':')[0];
        var ratio2 = ratio.split(':')[1];
        var result = Number(ratio1) / Number(ratio2);
        return result;
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
          'limit': ALL_RECORDS_SIZE,
          'logic': 'AND',
          '__selectFields': ['source']
        };
        var _queryObj = new Query(queryObject);
        socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.alertSources = result['hydra:member'];
            var _dataSource = {};
            if ($scope.socResult.alertSources.length > 0) {
              $scope.socResult.alertSources.forEach(element => {
                if (element.source !== null) {
                  _dataSource[element.source] = element.total;
                }
              });
              addForeignObject({ 'id': 'idIncomingAlertSources', 'title': $scope.config.alertSource.title, 'data': _dataSource });
            }
          }
        });
      }
  
      function getAutomationCalculation() {
        var _fromDate = currentDateMinusService($scope.config.days);
        var queryObject = {
          'limit': 3,
          'filters': [{
            'field': 'tags',
            'operator': 'ncontains',
            'value': 'system'
          }, {
            'field': 'modified',
            'operator': 'gte',
            'value':$filter('date')(_fromDate, 'yyyy-MM-dd HH:mm', 'UTC')
          }],
          'logic': 'AND',
          'aggregates': [{
            'field': 'template_iri',
            'operator': 'count'
          }]
        };
        socManagementService.getPlaybookRun(queryObject).then(function (result) {
          $scope.socResult.playbookSource = result.data;
          var _dataSource = {};
          var promises = [];
            if ($scope.socResult.playbookSource.length > 0) {
              $scope.socResult.playbookSource.forEach(element => {
                if (element.template_iri !== null) {
                  promises.push(socManagementService.getIriElement(element.template_iri).then(function (result) {
                    var _appendText = element.total > 1 ? ' times' : ' time';
                    _dataSource[result.data.name] = element.total + _appendText;
                  }));
                }
              });
              $q.all(promises).then(function(){
                addForeignObject({ 'id': 'idAutomationCalculation', 'title': $scope.config.top3PlaybookRun.title, 'data': _dataSource });
              });
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
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.alertSources = result['hydra:member'];
            var _dataSource = {};
            if ($scope.socResult.alertSources.length > 0) {
              $scope.socResult.alertSources.forEach(element => {
                if (element.type !== null) {
                  _dataSource[element.type] = element.total;
  
                }
              });
              addForeignObject({ 'id': 'idTopThreeAlerts', 'title': $scope.config.topAlerts.title, 'data': _dataSource });
            }
          }
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
          var _dataSource = {};
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
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
              value: 'currentDateMinus(' + $scope.config.days + $scope.config.days +')'
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
          addLabelCounts({ 'id': 'idAlertLabel', 'count': $scope.socResult.totalAlerts });
        }));
        $scope.alertIncidentPromises.push(socManagementService.getResourceData($scope.config.resource, _queryObjPreviousData).then(function (result) {
          $scope.socResult.previousTotalAlerts = result['hydra:member'][0].alerts;
        }));
      }
  
      function getClosedAlerts() {
        var picklist_name = 'AlertStatus';
        picklistsService.getPicklistByName(picklist_name).then(function (response) {
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
                    'value': 'currentDateMinus(' + $scope.config.days + $scope.config.days +')',
                    'type': 'datetime'
                  },
                  {
                    'field': $scope.dateFilterField,
                    'operator': 'lte',
                    'value': 'currentDateMinus('+ $scope.config.days +')',
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
            addLabelCounts({ 'id': 'idClosedLabel', 'count': $scope.socResult.closedAlerts });
          }));
          promises.push(socManagementService.getResourceData($scope.config.resource, _queryObjPreviousData).then(function (result) {
            $scope.socResult.previousClosedAlerts = result['hydra:member'][0].status;
          }));
          $q.all(promises).then(function () {
            calculatePercentage({
              'id': 'alertResolved',
              'title': $scope.config.alertResolved.title,
              'value': $scope.socResult.closedAlerts,
              'currentValue': $scope.socResult.closedAlerts,
              'lastValue': $scope.socResult.previousClosedAlerts
            });
          });
        });
      }
  
  
      function getTrueFalsePositiveAlerts() {
        var picklist_name2 = 'Closure Reason';
        picklistsService.getPicklistByName(picklist_name2).then(function (response) {
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
              addLabelCounts({ 'id': 'idFlasePositiveLabel', 'count': $scope.socResult.falsePositiveAlerts });
              addLabelCounts({ 'id': 'idTruePositiveLabel', 'count': ($scope.socResult.totalAlerts - $scope.socResult.falsePositiveAlerts) });
  
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
          addLabelCounts({ 'id': 'idIncidentsLabel', 'count': $scope.socResult.totalIncidents });
        }));

        $scope.alertIncidentPromises.push(socManagementService.getResourceData($scope.config.relatedResource, _previousQueryObj).then(function (result) {
          $scope.socResult.previousTotalIncidents = result['hydra:member'][0].incidents;
        }));

        $q.all($scope.alertIncidentPromises).then(function () {
          var ratioCalculated = calculateRatio($scope.socResult.totalAlerts,$scope.socResult.totalIncidents);
          var previousRatioCalculated = calculateRatio($scope.socResult.previousTotalAlerts,$scope.socResult.previousTotalIncidents);

          calculatePercentage({
            'id': 'ratio',
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
        socManagementService.getResourceData($scope.config.relatedResource, _queryObj).then(function (result) {
          var impactResult = 0;
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.totalImpact = result['hydra:member'][0].impact;
            impactResult = ($scope.socResult.totalImpact * $scope.config.artifacts.averageTime * $scope.config.artifacts.dollarValue) / 60;
          }
          addBlockData({ 'id': 'idImpactDivision', 'count': $filter('numberToDisplay')(impactResult)});
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
            addBlockData({ 'id': 'idAssetsDivision', 'count': $scope.socResult.totalAssets });
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
            addBlockData({ 'id': 'idArtifactsDivision', 'count': $filter('numberToDisplay')(artifactsResult) });
          }
        });
      }

      function getAlertToIncidentRatio(){

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
          'title': $scope.config.roi.title,
          'value': $filter('numberToDisplay')(_roiCurrentValue),
          'currentValue': _roiCurrentValue,
          'lastValue': _roiPreviousValue
        });
      }
  
      function calculateTimeSaving(currentValue, previousValue) {
        var _timeSavingCurrentValue = (currentValue * $scope.config.timeSaved.averageTime) * 60;
        var _timeSavingPreviousValue = (previousValue * $scope.config.timeSaved.averageTime) * 60;
        calculatePercentage({
          'id': 'overallTimeSaved',
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
        getAlertToIncidentRatio();
        getPlaybookRunCount();
        getPlaybookActionCount();
      }

    _init();
  }
})();
