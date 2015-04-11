import ZeroClipboard from 'ember-cli-zero-clipboard/components/zero-clipboard';
import Notify from 'ember-notify';

export default ZeroClipboard.extend({
  classNames: ['copy-url'],
  linkUrl: window.location.href,
  msg: 'Click me to copy your link',
  actions: {
    afterCopy: function(){
      // this gets triggered after the copy event
      Notify.success("Your link has been copied. Invite away!", {
        closeAfter: 5000
      });
    }
  }
});
