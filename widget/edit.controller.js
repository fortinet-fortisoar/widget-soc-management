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
  
      editSocManagement210Ctrl.$inject = ['$scope', '$uibModalInstance', 'config', 'Entity', 'Field', 'modelMetadatasService', 'appModulesService'];
  
    function editSocManagement210Ctrl($scope, $uibModalInstance, config, Entity, Field, modelMetadatasService, appModulesService) {
      $scope.cancel = cancel;
      $scope.save = save;
      $scope.config = config || {};
      $scope.params = {};
      $scope.jsonObjModuleList=[];
      $scope.loadAttributesForCustomModule = loadAttributesForCustomModule; 
      $scope.onChangeModuleType = onChangeModuleType;
      $scope.config.moduleType = $scope.config.moduleType ? $scope.config.moduleType : 'Across Modules';

      if ($scope.config.customModule) {
        $scope.loadAttributesForCustomModule();
      }  

      function loadAttributesForCustomModule() {
        $scope.fields = [];
        $scope.fieldsArray = [];
        $scope.objectFields = [];
        var entity = new Entity($scope.config.customModule);
        entity.loadFields().then(function () {
          for (var key in entity.fields) {
            //filtering out JSON fields 
            if (entity.fields[key].type === "object") {
              $scope.objectFields.push(entity.fields[key]);
            }
          }
          $scope.fields = entity.getFormFields();
          angular.extend($scope.fields, entity.getRelationshipFields());
          $scope.fieldsArray = entity.getFormFieldsArray();
        });
      }

      $scope.$watch('config.customModule', function (oldValue, newValue) {
        if ($scope.config.customModule && oldValue !== newValue) {
          if ($scope.config.query.filters) {
            delete $scope.config.query.filters;
          }
          delete $scope.config.customModuleField;
          $scope.loadAttributesForCustomModule();
        }
      });

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

      function onChangeModuleType() {
        delete $scope.config.query;
        delete $scope.config.customModuleField;
        delete $scope.config.customModule;
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
      appModulesService.load(true).then(function (modules) {
        $scope.modules = modules;

        //Create a list of modules with atleast one JSON field
        modules.forEach((module, index) =>{
          var moduleMetaData = modelMetadatasService.getMetadataByModuleType(module.type);
          for(let fieldIndex =0; fieldIndex < moduleMetaData.attributes.length; fieldIndex++){
            //Check If JSON field is present in the module
            if(moduleMetaData.attributes[fieldIndex].type === "object"){
              $scope.jsonObjModuleList.push(module);
              break;
            }
          }
        })
      })
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
  