var torii, container;

import toriiContainer from 'test/helpers/torii-container';
import configuration from 'torii/configuration';
import MockPopup from 'test/helpers/mock-popup';

var originalConfiguration = configuration.providers['stripe-connect'];

var mockPopup = new MockPopup();

var failPopup = new MockPopup({ state: 'invalid-state' });

var registry, container;

module('Stripe Connect - Integration', {
  setup: function(){
    var results = toriiContainer();
    registry = results[0];
    container = results[1];
    registry.register('torii-service:mock-popup', mockPopup, {instantiate: false});
    registry.register('torii-service:fail-popup', failPopup, {instantiate: false});
    registry.injection('torii-provider', 'popup', 'torii-service:mock-popup');

    torii = container.lookup("service:torii");
    configuration.providers['stripe-connect'] = {apiKey: 'dummy'};
  },
  teardown: function(){
    mockPopup.opened = false;
    configuration.providers['stripe-connect'] = originalConfiguration;
    Ember.run(container, 'destroy');
  }
});

test("Opens a popup to Stripe", function(){
  Ember.run(function(){
    torii.open('stripe-connect').finally(function(){
      ok(mockPopup.opened, "Popup service is opened");
    });
  });
});

test('Validates the state parameter in the response', function(){
  registry.injection('torii-provider', 'popup', 'torii-service:fail-popup');

  Ember.run(function(){
    torii.open('stripe-connect').then(null, function(e){
      ok(/has an incorrect session state/.test(e.message),
         'authentication fails due to invalid session state response');
    });
  });
});
