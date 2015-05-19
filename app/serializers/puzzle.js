import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  primaryKey: '_id',

  serialize: function(record, options) {
    var data = this._super(record, options);

    data.meta = {
      skip: record.get('skip')
    };

    return data;
  }
});
