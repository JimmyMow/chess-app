import DS from 'ember-data';

var ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api',
  ajaxError: function(jqXHR) {
    var error = this._super(jqXHR);

    if (jqXHR && jqXHR.status === 422) {
      var response = Ember.$.parseJSON(jqXHR.responseText),
          errors = {};
      if (response.errors !== undefined) {
        var jsonErrors = response.errors;
        Ember.EnumerableUtils.forEach(Ember.keys(jsonErrors), function(key) {
          errors[Ember.String.camelize(key)] = jsonErrors[key];
        });
      }
      return new DS.InvalidError(errors);
    } else {
      return error;
    }
  }
});

export default ApplicationAdapter;
