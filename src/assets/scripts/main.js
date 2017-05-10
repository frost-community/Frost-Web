import riot from 'riot';

// pages
import '../tags/pages/frost-dev.tag';

// components
import '../tags/frost-header.tag';
import '../tags/frost-footer.tag';
import '../tags/frost-login-form.tag';
import '../tags/frost-signup-form.tag';
import '../tags/frost-logout-button.tag';
import '../tags/frost-create-status-form.tag';
import '../tags/frost-public-timeline.tag';
import '../tags/frost-create-application-form.tag';
import '../tags/frost-page.tag';

const obs = riot.observable();
riot.mount('*', {obs: obs});
