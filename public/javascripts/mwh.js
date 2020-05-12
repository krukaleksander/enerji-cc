var app = angular.module('myApp', []);
app.controller('myCtrl', function ($scope) {
    $scope.prices = 0;
    $scope.marge = 50;
    $scope.mwh = 0;
    $scope.allMarge = 0;
    $scope.brutto = 0;
    $scope.calc = function () {
        let toCut = $scope.prices;
        let withoutComa = toCut.replace(/\,/g, '.');
        let withoutWhite = withoutComa.replace(/\s/g, '');
        let averrage = parseFloat(withoutWhite.slice(0, 6));
        let sphereOne = parseFloat(withoutWhite.slice(6, 12));
        let sphereTwo = parseFloat(withoutWhite.slice(12, 18));
        let sphereThree = parseFloat(withoutWhite.slice(18, 24));
        $scope.allMarge = parseInt($scope.marge) * parseInt($scope.mwh)
        return (
            `Średnia: ${averrage + parseInt($scope.marge)}, I strefa: ${sphereOne + parseInt($scope.marge)} Strefa II: ${sphereTwo + parseInt($scope.marge)} Strefa III: ${sphereThree + parseInt($scope.marge)}`
        )

    }

});