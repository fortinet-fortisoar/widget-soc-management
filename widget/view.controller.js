/* Copyright start
  Copyright (C) 2008 - 2022 Fortinet Inc.
  All rights reserved.
  FORTINET CONFIDENTIAL & FORTINET PROPRIETARY SOURCE CODE
  Copyright end */
'use strict';

/* jshint camelcase: false */

(function () {
  angular.module('cybersponse')
    .controller('socManagement210Ctrl', socManagement210Ctrl);

  socManagement210Ctrl.$inject = ['$scope', 'config', '$q', 'Query', '_', 'playbookService', '$filter',
    'currentDateMinusService', '$rootScope', 'socManagementService', 'ALL_RECORDS_SIZE', '$state', '$window', 'PagedCollection'];

  function socManagement210Ctrl($scope, config, $q, Query, _, playbookService, $filter, currentDateMinusService, $rootScope, socManagementService, ALL_RECORDS_SIZE, $state, $window, PagedCollection) {
    var loadedSVGDocument;
    $scope.percentageData = [];
    var configLoaded = false;
    var svgLoaded = false;
    var overflowStyle = 'display: inline-block;text-overflow:ellipsis;white-space: nowrap;overflow: hidden;opacity: 0.8;';
    var fontFamily = '\'Lato\', sans-serif';
    var noRecordStyle = 'margin-top: 10px;margin-left: 15px;color: red;';
    $scope.config.moduleType = $scope.config.moduleType ? $scope.config.moduleType : 'Across Modules';

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
        if ($scope.config.moduleType === 'Across Modules') {
          $scope.dateFilterField = $scope.config.timeRange || 'createDate';
          getResult();
        }
        else {
          populateCustomData();
        }
      }
    }

    function checkForSVGLoad() {
      document.getElementById('socSvgBackground').addEventListener('load', function () {
        loadedSVGDocument = this.getSVGDocument();
        svgLoaded = true;
        initializeData();
      });
    }
    //to populate funnel for custom module
    function populateCustomData() {
      var filters = {
        query: $scope.config.query
      };
      var pagedTotalData = new PagedCollection($scope.config.customModule, null, null);
      pagedTotalData.loadByPost(filters).then(function () {
        if (pagedTotalData.fieldRows.length === 0) {
          populateByJson({});
          return;
        }
        var data = pagedTotalData.fieldRows[0][$scope.config.customModuleField].value;
        if (!data) {
          data = {};
        }
        populateByJson(data);
      })
    }

    function populateByJson(customData) {
      //set keys to empty if keys are not present
      if (!customData.hasOwnProperty('dataBoxes')) {
        customData.dataBoxes = '';
      }
      if (!customData.hasOwnProperty('alertsFlow')) {
        customData.alertsFlow = '';
      }
      if (!customData.hasOwnProperty('impactAnalysis')) {
        customData.impactAnalysis = '';
      }
      if (!customData.hasOwnProperty('kpi')) {
        customData.kpi = '';
      }
      //populate the data from json into individual elements
      populateDataBoxes(customData.dataBoxes);
      populateAlertsFlow(customData.alertsFlow);
      populateImpactAnalysis(customData.impactAnalysis);
      populateKpi(customData.kpi);
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
          if (element.id === 'idAutomationCalculation') {
            _col1.setAttribute('style', overflowStyle + 'width: 265px;' + 'cursor:pointer;color:' + $scope.hoverColor + ';text-decoration:underline');
            var state = 'main.playbookDetail';
            var params = {
              id: $filter('getEndPathName')(element.template_iri[iriCount])
            };
            var url = $state.href(state, params);
            iriCount++;
            _col1.setAttribute('id', url);
            _row.appendChild(_col1);
            _col1.addEventListener('click', function (event) {
              $window.open(event.currentTarget.id, '_blank');
            });
          }
          else {
            if (element.id === 'idTopThreeAlerts') {
              _col1.setAttribute('style', overflowStyle + 'width: 165px;');
            }
            else {
              _col1.setAttribute('style', overflowStyle + 'width: 120px;');
            }
            _row.appendChild(_col1);
          }
          _row.appendChild(_col2);
          _col2.setAttribute('style', 'opacity:0.8;text-align:left;padding-right: 7px');
          mainTable.appendChild(_row);
        }
        mainDiv.appendChild(mainTable);
      }
      else {
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
      if (element.id === 'idTruePositiveLabel') {
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

      countDiv.innerHTML = element.count + '<span style="font-size:25px;margin-left: 5px;">' + element.title + '</span>';
      if (element.id === 'idResolvedAutomated') {
        countDiv.setAttribute('style', 'color: ' + $scope.textColor + ';font-size: 16px;font-style: italic;margin-top: 16px;font-family:' + fontFamily + ';')
        countDiv.innerHTML = element.count + '<span style="font-size:16px;margin-left: 5px;">' + element.title + '</span>';
      }
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
      countDiv.innerHTML = element.count + ' <div style="font-size:20px">' + element.title + '</div>';
      labelElem.appendChild(countDiv);
      source.after(labelElem);
    }

    function calculatePercentage(element) {
      var _percent = 0;
      element.percentChange = 0;
      if (element.lastValue > 0) {
        _percent = ((element.currentValue - element.lastValue) / element.lastValue) * 100;
        element.percentChange = _percent;
        if (_percent > 0) {
          element.increase = true;
        }
        else {
          element.increase = false;
        }
        element.percentChange = Math.abs(_percent);
      }
      else if (element.currentValue === 0) {
        element.percentChange = 0;
        element.increase = true;
      }
      else {
        element.percentChange = 100;
        element.increase = true;
      }
      $scope.percentageData.push(element);
      $scope.percentageData.sort((a, b) => a.sequence - b.sequence);
    }

    function calculateRatio(alerts, incidents) {
      var numOfIncidents = incidents;
      for (incidents; numOfIncidents > 1; numOfIncidents--) {
        if ((alerts % numOfIncidents) === 0 && (incidents % numOfIncidents) === 0) {
          alerts = alerts / numOfIncidents;
          incidents = incidents / numOfIncidents;
        }
      }
      var ratio = $filter('numberToDisplay')(alerts) + ':' + $filter('numberToDisplay')(incidents);
      return ratio;
    }

    function formulateRatio(ratio) {
      var result = 0;
      var ratio1 = ratio.split(':')[0];
      var ratio2 = ratio.split(':')[1];
      if (Number(ratio2) !== 0) {
        result = Number(ratio1) / Number(ratio2);
      }
      return result;
    }

    function sortObjectByKeys(object) {
      var sortable = [];
      for (var o in object) {
        sortable.push([o, object[o]]);
      }

      sortable.sort(function (a, b) {
        return b[1] - a[1];
      });

      let objSorted = {};
      sortable.forEach(function (item) {
        objSorted[item[0]] = item[1];
      });
      return objSorted;
    }

    //Query functions
    function getAlertSources() {
      var queryObject = {
        sort: [{
          field: 'total',
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
                _dataSource[element.source] = $filter('numberToDisplay')(element.total);
              }
              else {
                _dataSource.Unknown = $filter('numberToDisplay')(element.total);
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
        'limit': $scope.config.playbookExecutionLogLimit,
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
        'aggregates': [
          {
            'field': 'template_iri',
            'operator': 'count'
          }]
      };

      var queryToGetName = {
        sort: [{
          'field': 'total',
          'direction': 'DESC'
        }],
        'limit': $scope.config.playbookExecutionLogLimit,
        'filters': [{
          'field': 'tags',
          'operator': 'ncontains',
          'value': 'system'
        },
        {
          'field': 'modified',
          'operator': 'gte',
          'value': $filter('date')(_fromDate, 'yyyy-MM-dd HH:mm', 'UTC')
        }],
        'logic': 'AND',
        'aggregates': [
          {
            'field': 'name',
            'operator': 'count'
          }]
      };
      var queryObjectTags = {
        "sort": [
          {
            "field": "createDate",
            "direction": "DESC",
            "_fieldName": "createDate"
          }
        ],
        "limit": 90,
        "logic": "AND",
        "filters": [
          {
            "field": "recordTags",
            "value": [],
            "display": "",
            "operator": "in",
            "type": "array"
          },
          {
            "field": "isActive",
            "value": true,
            "operator": "eq"
          }
        ],
        "__selectFields": [
          "id", "name"
        ]
      }
      if ($scope.config.recordTags) {
        var playbookExcludeTag = []
        var playbookWithTags = []
        for (var i = 0; i < $scope.config.recordTags.length; i++) {
          var tagArr = $scope.config.recordTags[i].split('/');
          var tag = tagArr.pop();
          playbookWithTags.push(tag)
          playbookExcludeTag.push({
            'field': 'tags',
            'operator': 'ncontains',
            'value': tag
          })
        }
        queryObjectTags.filters[0].value = playbookWithTags;
        queryObject.filters = queryObject.filters.concat(playbookExcludeTag);
        queryToGetName.filters = queryToGetName.filters.concat(playbookExcludeTag);
      }

      socManagementService.getPlaybookRun(queryObject).then(function (result) {
        var names = {};
        socManagementService.getPlaybookRun(queryToGetName).then(function (resultName) {
          socManagementService.getAllPlaybooks(queryObjectTags).then(function (excludePlaybooks) {
            var playboooksToExclude = excludePlaybooks['hydra:member'].map(obj => obj.name).filter(name => name !== undefined);

            names = resultName.data;
            $scope.socResult.playbookSource = result.data;
            var _dataSource = null;
            var _iri = [];
            var promises = [];
            if ($scope.socResult.playbookSource.length > 0) {
              _dataSource = {};
              $scope.socResult.playbookSource.forEach((element, index) => {
                if (element.template_iri !== null) {
                  _dataSource[names[index].name] = $filter('numberToDisplay')(element.total);
                  _iri.push(element.template_iri);
                }
              });
              var updatedObject = {};
              for (let key in _dataSource) {
                if (!playboooksToExclude.includes(key)) {
                  updatedObject[key] = _dataSource[key];
                }
              }
              $q.all(promises).then(function () {
                var sortedDataSource = sortObjectByKeys(updatedObject);
                //We are fetching top 15 playbooks, some are excluded based on tags now to get top 3 playbooks we need to slice 3
                sortedDataSource = Object.fromEntries(Object.entries(sortedDataSource).slice(0, 3));
                addForeignObject({ 'id': 'idAutomationCalculation', 'title': $scope.config.top3PlaybookRun.title, 'data': sortedDataSource, 'template_iri': _iri });
              });
            }
            else {
              _dataSource = null;
              addForeignObject({ 'id': 'idAutomationCalculation', 'title': $scope.config.top3PlaybookRun.title, 'data': _dataSource, 'template_iri': _iri });
            }
          })
        });
      })
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
                _dataSource[element.type] = $filter('numberToDisplay')(element.total);

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
                _dataSource[element.category] = $filter('numberToDisplay')(element.total);
              }
            });
          }
        }
        addForeignObject({ 'id': 'idTopThreeIncidents', 'title': $scope.config.topIncidents.title, 'data': _dataSource });
      });
    }

    //label counts

    function getAlertCount() {
      var dateRangeFilter = [
        {
          field: $scope.dateFilterField,
          operator: 'gte',
          type: 'date',
          value: 'currentDateMinus(' + $scope.config.days + ')'
        },
        {
          field: $scope.dateFilterField,
          operator: 'lte',
          type: 'date',
          value: 'currentDateMinus(0)'
        }
      ];

      var countAggregate = {
        alias: 'alerts',
        field: 'name',
        operator: 'count'
      };
      var _query = {
        filters: dateRangeFilter,
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE
      };
      var _queryObj = new Query(_query);

      var previousDateRangeFilter = [
        {
          field: $scope.dateFilterField,
          operator: 'gte',
          type: 'date',
          value: 'currentDateMinus(' + $scope.config.days + $scope.config.days + ')'
        },
        {
          field: $scope.dateFilterField,
          operator: 'lte',
          type: 'date',
          value: 'currentDateMinus(' + $scope.config.days + ')'
        }
      ];

      var _previousQuery = {
        filters: previousDateRangeFilter,
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
        addLabelCounts({ 'id': 'idAlertLabel', 'count': $filter('numberToDisplay')($scope.socResult.totalAlerts), 'title': $scope.config.alerts.title });
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

        var queryAutomatedClosedAlerts = {
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
            },
            {
              'field': 'resolvedAutomatedly',
              'value': true,
              'display': '',
              'operator': 'eq',
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
        var _queryAutomatedClosedObj = new Query(queryAutomatedClosedAlerts);

        var promises = [];
        $scope.socResult.closedAlerts = 0;
        $scope.socResult.automatedClosed = 0;

        promises.push(socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.closedAlerts = result['hydra:member'][0].status;
          }
          addLabelCounts({ 'id': 'idClosedLabel', 'count': $filter('numberToDisplay')($scope.socResult.closedAlerts), 'title': $scope.config.closed.title });
        }));
        promises.push(socManagementService.getResourceData($scope.config.resource, _queryAutomatedClosedObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.automatedClosed = result['hydra:member'][0].status;
          }
          if ($scope.socResult.closedAlerts === 0) {
            var closedAutomatedAlerts = $scope.config.zeroResolvedAutomatically;
          }
          else {
            //add paranthesis 
            var closedAutomatedAlerts = '( ' + Math.round(($scope.socResult.automatedClosed * 100) / $scope.socResult.closedAlerts) + '%';
          }
          addLabelCounts({ 'id': 'idResolvedAutomated', 'count': closedAutomatedAlerts, 'title': $scope.config.automatedResolved.title + ' )' });
        }));
        promises.push(socManagementService.getResourceData($scope.config.resource, _queryObjPreviousData).then(function (result) {
          $scope.socResult.previousClosedAlerts = result['hydra:member'][0].status;
        }));
        $q.all(promises).then(function () {
          calculatePercentage({
            'id': 'alertResolved',
            'sequence': 5,
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
        $scope.socResult.truePositiveAlerts = 0;
        socManagementService.getResourceData($scope.config.resource, _queryObj).then(function (result) {
          if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
            $scope.socResult.falsePositiveAlerts = result['hydra:member'][0].status;
            $scope.socResult.truePositiveAlerts = ($scope.socResult.totalAlerts - $scope.socResult.falsePositiveAlerts);
            addLabelCounts({ 'id': 'idFlasePositiveLabel', 'count': $filter('numberToDisplay')($scope.socResult.falsePositiveAlerts), 'title': $scope.config.falsePositive.title });
            addLabelCounts({ 'id': 'idTruePositiveLabel', 'count': $filter('numberToDisplay')($scope.socResult.truePositiveAlerts), 'title': $scope.config.truePositive.title });

          }
        });
      });

    }

    function getTotalIncidentCount() {
      var dateRangeFilter = [
        {
          field: $scope.dateFilterField,
          operator: 'gte',
          type: 'date',
          value: 'currentDateMinus(' + $scope.config.days + ')'
        },
        {
          field: $scope.dateFilterField,
          operator: 'lte',
          type: 'date',
          value: 'currentDateMinus(0)'
        }
      ];

      var previousDateRangeFilter = [
        {
          field: $scope.dateFilterField,
          operator: 'gte',
          type: 'date',
          value: 'currentDateMinus(' + $scope.config.days + $scope.config.days + ')'
        },
        {
          field: $scope.dateFilterField,
          operator: 'lte',
          type: 'date',
          value: 'currentDateMinus(' + $scope.config.days + ')'
        }
      ];

      var countAggregate = {
        alias: 'incidents',
        field: 'name',
        operator: 'count'
      };
      var _query = {
        filters: dateRangeFilter,
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _previousQuery = {
        filters: previousDateRangeFilter,
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
        addLabelCounts({ 'id': 'idIncidentsLabel', 'count': $filter('numberToDisplay')($scope.socResult.totalIncidents), 'title': $scope.config.incident.title });
      }, function () {
        addLabelCounts({ 'id': 'idIncidentsLabel', 'count': $scope.socResult.totalIncidents, 'title': $scope.config.incident.title });
      }));

      $scope.alertIncidentPromises.push(socManagementService.getResourceData($scope.config.relatedResource, _previousQueryObj).then(function (result) {
        $scope.socResult.previousTotalIncidents = result['hydra:member'][0].incidents;
      }));

      $q.all($scope.alertIncidentPromises).then(function () {
        var ratioCalculated = calculateRatio($scope.socResult.totalAlerts, $scope.socResult.totalIncidents);
        var previousRatioCalculated = calculateRatio($scope.socResult.previousTotalAlerts, $scope.socResult.previousTotalIncidents);
        calculatePercentage({
          'id': 'ratio',
          'sequence': 1,
          'title': $scope.config.ratio.title,
          'value': ratioCalculated,
          'currentValue': formulateRatio(ratioCalculated),
          'lastValue': formulateRatio(previousRatioCalculated)
        });
      });
    }

    function getImpactCount() {
      var dateRangeFilter = [
        {
          field: $scope.dateFilterField,
          operator: 'gte',
          type: 'date',
          value: 'currentDateMinus(' + $scope.config.days + ')'
        },
        {
          field: $scope.dateFilterField,
          operator: 'lte',
          type: 'date',
          value: 'currentDateMinus(0)'
        },
        {
          'field': 'impactROI',
          'operator': 'isnull',
          'value': 'false'
        }
      ];

      var countAggregate = {
        alias: 'impact',
        field: 'impactROI',
        operator: 'sum'
      };
      var _query = {
        filters: dateRangeFilter,
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
        addBlockData({ 'id': 'idImpactDivision', 'count': '$' + $filter('numberToDisplay')(impactResult), 'title': $scope.config.impact.title });
      }, function () {
        addBlockData({ 'id': 'idImpactDivision', 'count': '$' + $filter('numberToDisplay')(impactResult), 'title': $scope.config.impact.title });
      });
    }

    function getTotalAssetsCount() {
      var dateRangeFilter = [
        {
          field: $scope.dateFilterField,
          operator: 'gte',
          type: 'datetime',
          value: 'currentDateMinus(' + $scope.config.days + ')'
        },
        {
          field: $scope.dateFilterField,
          operator: 'lte',
          type: 'datetime',
          value: 'currentDateMinus(0)'
        }
      ];

      var countAggregate = {
        alias: 'assets',
        field: '*',
        operator: 'countdistinct'
      };
      var _query = {
        filters: dateRangeFilter,
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _queryObj = new Query(_query);
      $scope.socResult.totalAssets = 0;
      socManagementService.getResourceData($scope.config.relatedResource2, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.totalAssets = result['hydra:member'][0].assets;
          addBlockData({ 'id': 'idAssetsDivision', 'count': $filter('numberToDisplay')($scope.socResult.totalAssets), 'title': $scope.config.assets.title });
        }
      }, function () {
        addBlockData({ 'id': 'idAssetsDivision', 'count': $filter('numberToDisplay')($scope.socResult.totalAssets), 'title': $scope.config.assets.title });
      });
    }

    function getArtifactsAnalysed() {
      var dateRangeFilter = [
        {
          field: $scope.dateFilterField,
          operator: 'gte',
          type: 'datetime',
          value: 'currentDateMinus(' + $scope.config.days + ')'
        },
        {
          field: $scope.dateFilterField,
          operator: 'lte',
          type: 'datetime',
          value: 'currentDateMinus(0)'
        }
      ];

      var countAggregate = {
        alias: 'indicators',
        field: '*',
        operator: 'countdistinct'
      };
      var _query = {
        filters: dateRangeFilter,
        aggregates: [countAggregate],
        limit: ALL_RECORDS_SIZE

      };
      var _queryObj = new Query(_query);
      socManagementService.getResourceData($scope.config.relatedResource3, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.totalArtifactsAnalysed = result['hydra:member'][0].indicators;
          addBlockData({ 'id': 'idArtifactsDivision', 'count': $filter('numberToDisplay')($scope.socResult.totalArtifactsAnalysed), 'title': $scope.config.artifacts.title });
        }
      }, function () {
        addBlockData({ 'id': 'idArtifactsDivision', 'count': $filter('numberToDisplay')($scope.socResult.totalArtifactsAnalysed), 'title': $scope.config.artifacts.title });
      });
    }

    function getMTTRAlert() {
      var dateRangeFilter = {
        logic: 'AND',
        type: 'datetime',
        _field: $scope.config.alertMttr.resolveCriteria,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,' + $scope.config.days + ', 0, 0, 0)',
        filters: [
          {
            field: $scope.config.alertMttr.resolveCriteria,
            operator: 'gte',
            type: 'date',
            value: 'getRelativeDate(0, 0,' + (-1 * $scope.config.days) + ', 0, 0, 0)'
          },
          {
            field: $scope.config.alertMttr.resolveCriteria,
            operator: 'lte',
            type: 'date',
            value: 'getRelativeDate(0, 0, 0, 0, 0, 0)'
          }
        ]
      };

      var previousDateRangeFilter = {
        logic: 'AND',
        type: 'datetime',
        _field: $scope.config.alertMttr.resolveCriteria,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,' + (-1 * ($scope.config.days + $scope.config.days)) + ', 0, 0, 0)',
        filters: [
          {
            field: $scope.config.alertMttr.resolveCriteria,
            operator: 'gte',
            type: 'date',
            value: 'getRelativeDate(0, 0,' + (-1 * ($scope.config.days + $scope.config.days)) + ', 0, 0, 0)'
          },
          {
            field: $scope.config.alertMttr.resolveCriteria,
            operator: 'lte',
            type: 'date',
            value: 'getRelativeDate(0, 0,' + (-1 * $scope.config.days) + ', 0, 0, 0)'
          }
        ]
      };
      var queryAggregates = {
        alias: 'value',
        field: $scope.config.alertMttr.resolveCriteria + ',' + $scope.config.alertMttr.criteria,
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
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.alertMttr = result['hydra:member'][0].value || 0;
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
          'sequence': 7,
          'title': $scope.config.alertMttr.title,
          'value': $filter('dayToDisplay')($scope.socResult.alertMttr),
          'currentValue': $scope.socResult.alertMttr,
          'lastValue': $scope.socResult.previousAlertMttr
        });
      });
    }

    function getMTTRIncident() {
      var dateRangeFilter = {
        logic: 'AND',
        type: 'datetime',
        _field: $scope.config.incidentMttr.resolveCriteria,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,' + $scope.config.days + ', 0, 0, 0)',
        filters: [
          {
            field: $scope.config.incidentMttr.resolveCriteria,
            operator: 'gte',
            type: 'date',
            value: 'getRelativeDate(0, 0,' + (-1 * $scope.config.days) + ', 0, 0, 0)'
          },
          {
            field: $scope.config.incidentMttr.resolveCriteria,
            operator: 'lte',
            type: 'date',
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
        _field: $scope.config.incidentMttr.resolveCriteria,
        _operator: 'date',
        _value: 'getRelativeDate(0, 0,' + (-1 * ($scope.config.days + $scope.config.days)) + ', 0, 0, 0)',
        filters: [
          {
            field: $scope.config.incidentMttr.resolveCriteria,
            operator: 'gte',
            type: 'date',
            value: 'getRelativeDate(0, 0,' + (-1 * ($scope.config.days + $scope.config.days)) + ', 0, 0, 0)'
          },
          {
            field: $scope.config.incidentMttr.resolveCriteria,
            operator: 'lte',
            type: 'date',
            value: 'getRelativeDate(0, 0,' + (-1 * $scope.config.days) + ', 0, 0, 0)'
          }
        ]
      };

      var queryAggregates = {
        alias: 'value',
        field: $scope.config.incidentMttr.resolveCriteria + ',' + $scope.config.incidentMttr.criteria,
        operator: 'avg'
      };
      var _query = {
        filters: [dateRangeFilter, _queryFilter],
        aggregates: [queryAggregates],
        limit: ALL_RECORDS_SIZE
      };
      var _queryObj = new Query(_query);

      var _previousQuery = {
        filters: [previousDateRangeFilter, _queryFilter],
        aggregates: [queryAggregates],
        limit: ALL_RECORDS_SIZE
      };
      var _previousQueryObj = new Query(_previousQuery);

      var promises = [];
      promises.push(socManagementService.getResourceData($scope.config.relatedResource, _queryObj).then(function (result) {
        if (result && result['hydra:member'] && result['hydra:member'].length > 0) {
          $scope.socResult.incidentMttr = result['hydra:member'][0].value || 0;
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
          'sequence': 8,
          'title': $scope.config.incidentMttr.title,
          'value': $filter('dayToDisplay')($scope.socResult.incidentMttr),
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
          'sequence': 2,
          'title': $scope.config.playbookRun.title,
          'value': $filter('numberToDisplay')($scope.playbookRun),
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
        timeWindow: {
          'type': 'absolute',
          'startTime': $filter('date')(_lastFromDate, 'yyyy-MM-dd HH:mm:ss', 'UTC'),
          'endTime': $filter('date')(_lastToDate, 'yyyy-MM-dd HH:mm:ss', 'UTC')
        }
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
          'sequence': 3,
          'title': $scope.config.actionsExecuted.title,
          'value': $filter('numberToDisplay')(currentValue),
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
        'sequence': 4,
        'title': $scope.config.roi.title,
        'value': '$' + $filter('numberToDisplay')(_roiCurrentValue),
        'currentValue': _roiCurrentValue,
        'lastValue': _roiPreviousValue
      });
    }

    function calculateTimeSaving(currentValue, previousValue) {
      var _timeSavingCurrentValue = (currentValue * $scope.config.timeSaved.averageTime) * 60;
      var _timeSavingPreviousValue = (previousValue * $scope.config.timeSaved.averageTime) * 60;
      calculatePercentage({
        'id': 'overallTimeSaved',
        'sequence': 6,
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

    function populateKpi(kpi) {
      var allCustomDataIds = $scope.config.allCustomDataIds.kpi;
      for (var i = 0; i < kpi.length; i++) {
        if (allCustomDataIds.hasOwnProperty(kpi[i].id)) {
          var keyToDelete =  kpi[i].id;          
          //mapping json ID's with the required ids for SVG
          kpi[i].id = allCustomDataIds[kpi[i].id];
          if(kpi[i].id === 'roi'){
            kpi[i]['value'] = kpi[i]['value'].replace(/^\$/, '');
          }
          if (!isNaN(kpi[i]['value'])) { 
            kpi[i]['value'] = $filter('numberToDisplay')(kpi[i]['value']); 
          }
          if (kpi[i].id === 'roi' && !kpi[i]['value'].startsWith('$')) {
            kpi[i]['value'] = '$' + kpi[i]['value'];
          }


          $scope.percentageData.push(kpi[i]);
        }
        //removing present IDs
        delete allCustomDataIds[keyToDelete];
      }
      // setting element null for the ids not found
      if (Object.keys(allCustomDataIds).length  > 0) {
        for (var i = 0; i < $scope.config['kpi'].length; i++) {
          if (allCustomDataIds.hasOwnProperty($scope.config['kpi'][i].inputJsonId)) {
            console.log("Key '"+ $scope.config['kpi'][i].inputJsonId + "' is not present in kpi" )
            var element = $scope.config['kpi'][i];
            element.title = $scope.config.keyNotFoundError;
            $scope.percentageData.push(element);
          }
        }
      }
    }

    function populateImpactAnalysis(impactAnalysis) {
      var allCustomDataIds = $scope.config.allCustomDataIds.impactAnalysis;
      for (var i = 0; i < impactAnalysis.length; i++) {
        if (allCustomDataIds.hasOwnProperty(impactAnalysis[i].id)) {
          var keyToDelete =  impactAnalysis[i].id;
          // setting id received from user to Id required by svg
          impactAnalysis[i].id = allCustomDataIds[impactAnalysis[i].id];
          var element = impactAnalysis[i];
          if (!isNaN(element.value)) { 
            element.count = $filter('numberToDisplay')(element.value); 
          }
          else{
            element.count = element.value;
          }
          addBlockData(element);
          //removing present IDs
          delete allCustomDataIds[keyToDelete];
        }
      }
      // setting element null for the ids not found
      if (Object.keys(allCustomDataIds).length > 0) {
        for (var i = 0; i < $scope.config['impactAnalysis'].length; i++) {
          if (allCustomDataIds.hasOwnProperty($scope.config['impactAnalysis'][i].inputJsonId)) {
            console.log("Key '"+ $scope.config['impactAnalysis'][i].inputJsonId + "' is not present in impactAnalysis" )
            var element = $scope.config['impactAnalysis'][i];
            element.count = element.value;
            element.title = $scope.config.keyNotFoundError;
            addBlockData(element);
          }
        }
      }
    }

    function populateAlertsFlow(alertsFlow) {
      var allCustomDataIds = $scope.config.allCustomDataIds.alertsFlow;
      for (var i = 0; i < alertsFlow.length; i++) {
        if (allCustomDataIds.hasOwnProperty(alertsFlow[i].id)) {
          var keyToDelete =  alertsFlow[i].id;
          // setting id received from user to Id required by svg
          alertsFlow[i].id = allCustomDataIds[alertsFlow[i].id];
          var element = alertsFlow[i];
          if (!isNaN(element.value)) { 
            element.count = $filter('numberToDisplay')(element.value); 
          }

          else{
            element.count = element.value;
          }
          addLabelCounts(element);
          //removing present IDs
          delete allCustomDataIds[keyToDelete];

        }
      }
      // setting element null for the ids not found
      if ( Object.keys(allCustomDataIds).length > 0) {
        for (var i = 0; i < $scope.config['alertsFlow'].length; i++) {
          if (allCustomDataIds.hasOwnProperty($scope.config['alertsFlow'][i].inputJsonId)) {
            console.log("Key '"+ $scope.config['alertsFlow'][i].inputJsonId + "' is not present in alertsFlow" )
            var element = $scope.config['alertsFlow'][i];
            element.count = element.value;
            //since there are brackets surrounding resolved alerts, the error message is different 
            if(element.id != 'idResolvedAutomated'){
              element.title = $scope.config.keyNotFoundError;
            }
            addLabelCounts(element);
          }
        }
      }
    }

    function populateDataBoxes(dataBoxes) {
      //Expected keys
      var allCustomDataIds = $scope.config.allCustomDataIds.dataBoxes;
      for (var i = 0; i < dataBoxes.length; i++) {
        if (allCustomDataIds.hasOwnProperty(dataBoxes[i].id)) {
          var keyToDelete =  dataBoxes[i].id;
          // setting id received from user to Id required by svg
          dataBoxes[i].id = allCustomDataIds[dataBoxes[i].id];
          var element = dataBoxes[i];
          var dataArray = Object.entries(element.data);
          //sorting the boxes data according to count
          dataArray.sort((a, b) => b[1] - a[1]);
          element.data = {};
          for (var index = 1; index <= Math.min($scope.config.maxCountForBoxes, dataArray.length); index++) {
            if (!isNaN(dataArray[index - 1][1]))
            {
              element.data[dataArray[index - 1][0]] = $filter('numberToDisplay')(dataArray[index - 1][1]);
            }
          }
          addForeignObject(element);
          //removing present IDs
          delete allCustomDataIds[keyToDelete];
        }
      }
      // setting element null for the ids not found
      if (Object.keys(allCustomDataIds).length > 0) {
        for (var i = 0; i < $scope.config['dataBoxes'].length; i++) {
          if (allCustomDataIds.hasOwnProperty($scope.config['dataBoxes'][i].inputJsonId)) {
            console.log("Key '"+ $scope.config['dataBoxes'][i].inputJsonId + "' is not present in dataBoxes" )
            var element = $scope.config['dataBoxes'][i];
            element.title = $scope.config.keyNotFoundError;
            addForeignObject(element);
          }
        }
      }
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
