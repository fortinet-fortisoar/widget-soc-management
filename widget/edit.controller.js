/* Copyright start
  Copyright (C) 2008 - 2022 Fortinet Inc.
  All rights reserved.
  FORTINET CONFIDENTIAL & FORTINET PROPRIETARY SOURCE CODE
  Copyright end */
  'use strict';
  /* jshint camelcase: false */
  
  (function() {
    angular
      .module('cybersponse')
      .controller('editSocManagement210Ctrl', editSocManagement210Ctrl);
  
      editSocManagement210Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'Entity', 'Field'];
  
    function editSocManagement210Ctrl($scope, $uibModalInstance, config, Entity, Field) {
      $scope.cancel = cancel;
      $scope.save = save;
      $scope.config = config || {};
      $scope.params = {};

       function loadAttributes() {
        var entity = new Entity('alerts');
        $scope.params.dateField = [];
        entity.loadFields().then(function() {
          for (var key in entity.fields) {
            if (entity.fields[key].type === 'datetime') {
              $scope.params.dateField.push(entity.fields[key]);
              entity.fields[key].type = 'datetime.quick';
            }
          }
          $scope.params.fields = entity.getFormFields();
          angular.extend($scope.params.fields, entity.getRelationshipFields());
          $scope.params.fieldsArray = entity.getFormFieldsArray();
        });
      }
      
      function init() {
        $scope.tagsField  = 
          new Field({
          name: 'Tags',
          writeable: true,
          title: 'Tags',
          formType: 'tags',
          dataSource: {
              model: 'recordTags'
          }
        }),
        loadAttributes();
      }


      function cancel() {
        $uibModalInstance.dismiss('cancel');
      }
  
      function save() {
        if ($scope.socManagementForm.$invalid) {
          $scope.socManagementForm.$setTouched();
          $scope.socManagementForm.$focusOnFirstError();
          return;
        }
        $uibModalInstance.close($scope.config);
      }
  
      init();
    }
  })();
  