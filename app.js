'use strict';

angular.module('ngWebglDemo')

  .controller('AppCtrl', ['$scope', '$timeout', function ($scope, $timeout) {

      $scope.canvasWidth = 400;
      $scope.canvasHeight = 800;
      $scope.dofillcontainer = true;
      $scope.scale = 1;
      $scope.materialType = 'lambert';



      $scope.rangeSlider = {
          min: 0,
          max: 500,
          ceil: 1000,
          floor: 0
      };

      $scope.rangeSlider2 = {
          min: 0,
          max: 500,
          ceil: 1000,
          floor: 0
      };

      $scope.rangeSlider3 = {
          min: 0,
          max: 500,
          ceil: 1000,
          floor: 0
      };

      $scope.color1 = $scope.color2 = $scope.color3 = "rgb(240, 216, 216)";


      $scope.obj = [{ min: 0,
          max: 800,
          ceil: 1000,
          floor: 0,
          color: "rgb(240, 216, 216)",
          isActive: true
      }];


      $scope.addObj = function () {
          $scope.obj.push({ min: 0,
              max: 800,
              ceil: 1000,
              floor: 0,
              color: "rgb(240, 216, 216)"
          });
      }

      $scope.removeObj = function (index) {
          if ($scope.obj.length > 1) {
              $scope.obj[index].isActive = false;
              $timeout(function () { $scope.obj.splice(index, 1); }, 250);
          }
     
      }



  } ]);