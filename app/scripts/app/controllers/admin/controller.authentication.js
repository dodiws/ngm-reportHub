/**
 * @ngdoc function
 * @name ngmReportHubApp.controller:ProjectFinancialsCtrl
 * @description
 * # ProjectFinancialsCtrl
 * Controller of the ngmReportHub
 */

angular.module('ngm.widget.form.authentication', ['ngm.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('form.authentication', {
        title: 'ReportHub Authentication Form',
        description: 'ReportHub Authentication Form',
        controller: 'AuthenticationFormCtrl',
        templateUrl: '/scripts/app/views/view.html'
      });
  })
  .controller( 'AuthenticationFormCtrl', [
    '$scope',
    '$http',
    '$location',
    '$timeout',
    '$filter',
    'ngmAuth',
    'ngmUser',
    'ngmData',
    'config',
    function( $scope, $http, $location, $timeout, $filter, ngmAuth, ngmUser, ngmData, config ){

      // project
      $scope.panel = {

        err: false,

        user: ngmUser.get(),

        // adminRegion
        adminRegion: [
          { adminRpcode: 'EMRO', adminRname: 'EMRO', admin0pcode: 'AF', admin0name: 'Afghanistan' },
          { adminRpcode: 'AFRO', adminRname: 'AFRO', admin0pcode: 'ET', admin0name: 'Ethiopia' },
          { adminRpcode: 'EMRO', adminRname: 'EMRO', admin0pcode: 'IQ', admin0name: 'Iraq' },
          { adminRpcode: 'AFRO', adminRname: 'AFRO', admin0pcode: 'KE', admin0name: 'Kenya' },
          { adminRpcode: 'AFRO', adminRname: 'AFRO', admin0pcode: 'NG', admin0name: 'Nigeria' },
          { adminRpcode: 'EMRO', adminRname: 'EMRO', admin0pcode: 'SO', admin0name: 'Somalia' },
          { adminRpcode: 'EMRO', adminRname: 'EMRO', admin0pcode: 'SY', admin0name: 'Syria' },
          { adminRpcode: 'EMRO', adminRname: 'EMRO', admin0pcode: 'UA', admin0name: 'Ukraine' },
          { adminRpcode: 'EMRO', adminRname: 'EMRO', admin0pcode: 'UR', admin0name: 'Uruk' }
        ],

        // cluster
        cluster: {
          'cvwg': { cluster: 'MPC' },
          'agriculture': { cluster: 'Agriculture' },
          'education': { cluster: 'Education' },
          'eiewg': { cluster: 'EiEWG' },
          'esnfi': { cluster: 'ESNFI' },
          'fsac': { cluster: 'FSAC' },
          'health': { cluster: 'Health' },
          'nutrition': { cluster: 'Nutrition' },
          'protection': { cluster: 'Protection' },
          'rnr_chapter': { cluster: 'R&R Chapter' },
          'wash': { cluster: 'WASH' }
        },

        // login fn
        login: function( ngmLoginForm ){

          // if invalid
          if( ngmLoginForm.$invalid ){
            // set submitted for validation
            ngmLoginForm.$setSubmitted();
          } else {

            // login
            ngmAuth
              .login({ user: $scope.panel.user }).success( function( result ) {

              // db error!
              if( result.err || result.summary ){
                var msg = result.summary ? result.summary : result.msg;
                Materialize.toast( msg, 6000, 'error' );
              }

              // success
              if ( !result.err && !result.summary ){

                // go to default org page
                $location.path( result.app_home );
                $timeout( function(){
                  Materialize.toast( 'Welcome back ' + result.username + '!', 3000, 'note' );
                }, 2000);
              }

            });

          }
        },

        // update profile
        update: function(ngmProfileForm) {

          // merge adminRegion
          $scope.panel.user = angular.merge( {}, ngmUser.get(), $scope.panel.user );

          // register
          ngmAuth
            .updateProfile({ user: $scope.panel.user }).success(function( result ) {

              // db error!
              if( result.err || result.summary ){
                var msg = result.msg ? result.msg : 'error!';
                Materialize.toast( msg, 6000, msg );
              }

              // success
              if ( result.success ){
                // set localStorage
                ngmUser.set( $scope.panel.user );
                // success message
                $timeout( function(){
                  Materialize.toast( 'Success! Profile updated!', 3000, 'success' );
                }, 1000);
              }

            });
        },

        // register fn
        register: function( ngmRegisterForm ){

          // merge adminRegion
          $scope.panel.user = angular.merge( {}, $scope.panel.user,
                                                  $scope.panel.adminRegion[ $scope.panel.user.admin0pcode ],
                                                  $filter('filter')( $scope.panel.adminRegion, { admin0pcode: $scope.panel.user.admin0pcode }, true)[0],
                                                  $scope.panel.cluster[ $scope.panel.user.cluster_id ] );

          // register
          ngmAuth
            .register({ user: $scope.panel.user }).success(function( result ) {

            // db error!
            if( result.err || result.summary ){
              var msg = result.summary ? result.summary : result.msg;
              Materialize.toast( msg, 6000, 'error' );
            }

            // success
            if ( !result.err && !result.summary ){
              // go to default org page
              $location.path( result.app_home );
              $timeout( function(){
                Materialize.toast( 'Welcome ' + result.username + ', time to create a Project!', 3000, 'success' );
              }, 2000);
            }

          });

        },

        // register fn
        passwordResetSend: function( ngmResetForm ){

          // if $invalid
          if(ngmResetForm.$invalid){
            // set submitted for validation
            ngmResetForm.$setSubmitted();
          } else {

            // user toast msg
            $timeout(function(){
              Materialize.toast('Your Email Is Being Prepared!', 3000, 'note');
            }, 400);

            // resend password email
            ngmAuth.passwordResetSend({
                user: $scope.panel.user,
                url: ngmAuth.LOCATION + '/desk/#/cluster/find/'
              }).success( function( result ) {

                // go to password reset page
                $( '.carousel' ).carousel( 'prev' );

                // user toast msg
                $timeout(function(){
                  Materialize.toast('Email Sent! Please Check Your Inbox', 3000, 'success');
                }, 400);

              }).error(function( err ) {

                // set err
                $scope.panel.err = err;

                // update
                $timeout(function(){
                  Materialize.toast( err.msg, 6000, 'error' );
                }, 400);
              });
          }

        },

        // register fn
        passwordReset: function( ngmResetPasswordForm, token ){

          // if $invalid
          if(ngmResetPasswordForm.$invalid){
            // set submitted for validation
            ngmResetPasswordForm.$setSubmitted();
          } else {

            // register
            ngmAuth.passwordReset({ reset: $scope.panel.user, token: token })
              .success( function( result ) {

              // go to default org page
              $location.path( '/' + result.app_home );

              // user toast msg
              $timeout(function(){
                Materialize.toast( 'Welcome back ' + result.username + '!', 3000, 'note' );
              }, 2000);


            }).error(function(err) {
              // update
              $timeout(function(){
                Materialize.toast( err.msg, 6000, 'error' );
              }, 1000);
            });
          }

        },

        // RnR chapter validation
        organizationDisabled: function(){

          var disabled = true;
          if ( $scope.panel.user && $scope.panel.user.admin0pcode && $scope.panel.user.cluster_id && $scope.panel.user.organization_name ) {
            // not R&R Chapter
            if ( $scope.panel.user.cluster_id !== 'rnr_chapter' ) {
              disabled = false;
            } else {
              if ( $scope.panel.user.organization === 'UNHCR' || $scope.panel.user.organization === 'IOM' ) {
                disabled = false;
              } else {
                disabled = true;
              }
            }
          }
          return disabled;
        },

        // select org
        onOrganizationSelected: function(){
          // filter
          $scope.select = $filter( 'filter' )( $scope.panel.organizations, { organization: $scope.panel.user.organization }, true );
          // merge org
          var org = angular.copy( $scope.select[0] );
          delete org.id;
          angular.merge( $scope.panel.user, org );

          // update home page for iMMAP Ethiopia
          if ( $scope.panel.user.organization === 'iMMAP' 
                && $scope.panel.user.admin0pcode === 'ET' ) {
              $scope.panel.user.app_home = '/immap/';
          } else {
            delete $scope.panel.user.app_home;
          }

          // validate
          if ( $scope.panel.user && $scope.panel.user.organization_name ) {
            // not R&R Chapter
            if ( $scope.panel.user.cluster_id !== 'rnr_chapter' ) {
              // update icon
              $( '.organization_symbol' ).css({ 'color': 'teal' });
              // toast
              Materialize.toast( org.organization + '<br/>' + org.organization_name + ' Selected...', 4000, 'note' );
            } else {
              if ( $scope.panel.user.organization === 'UNHCR' || $scope.panel.user.organization === 'IOM' ) {
                // update icon
                $( '.organization_symbol' ).css({ 'color': 'teal' });
                // toast
                Materialize.toast( org.organization + '<br/>' + org.organization_name + ' Selected...', 4000, 'note' );
              } else {
                Materialize.toast( 'Only UNHCR or IOM Can Register in R&R Chapter!', 6000, 'error' );
              }
            }
          }
        }

      }

      // Merge defaults with config
      $scope.panel = angular.merge( {}, $scope.panel, config );

      // get organizations
      // if ( !localStorage.getObject( 'organizations') ){

        // set
        $http.get( ngmAuth.LOCATION + '/api/list/organizations' ).then(function( organizations ){
          localStorage.setObject( 'organizations', organizations.data );
          $scope.panel.organizations = organizations.data;
          $timeout(function() {
            $( 'select' ).material_select();
          }, 400);
        });

      // } else {

        // set
        // $scope.panel.organizations = localStorage.getObject( 'organizations');
        // $timeout(function() {
        //   $( 'select' ).material_select();
        // }, 100);

      // }

      // on page load
      angular.element(document).ready(function () {

        // give a few seconds to render
        $timeout(function() {

          // profile page
          if( $location.path() === '/immap/profile' && 
                $scope.panel.user.organization === 'iMMAP' &&
                $scope.panel.user.admin0pcode === 'ET' ) {
            $( '.carousel' ).css({ 'min-height': '960px' });
          }

          // on change update icon color
          $( '#ngm-country' ).on( 'change', function() {
            if( $( this ).find( 'option:selected' ).text() ) {
              $( '.country' ).css({ 'color': 'teal' });
            }
          });

          // on change update icon color
          $( '#ngm-cluster' ).on( 'change', function() {
            if ( $( this ).find( 'option:selected' ).text() ) {
              $( '.cluster' ).css({ 'color': 'teal' });
            }
          });

          // if iMMAP & ethiopia
          // $( '#organization-next' ).click( function( e ){
          //   if ( $scope.panel.user.organization === 'iMMAP' 
          //         && $scope.panel.user.admin0pcode === 'ET' ) {
          //     $( '.carousel' ).css({ 'min-height': '890px' });
          //   } else {
          //     $( '.carousel' ).css({ 'min-height': '640px' });
          //   }
          // });
          // // if iMMAP & ethiopia
          // $( '#login-back' ).click( function( e ){
          //   if ( $scope.panel.user.organization === 'iMMAP' 
          //         && $scope.panel.user.admin0pcode === 'ET' ) {
          //     $( '.carousel' ).css({ 'min-height': '890px' });
          //   } else {
          //     $( '.carousel' ).css({ 'min-height': '640px' });
          //   }
          // });

        }, 900 );

      });

    }

]);
