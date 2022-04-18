const { useQuasar } = Quasar;
const { ref } = Vue;

/**
 * This options get injected via Streamelements
 */
let userOptions = {
  channelName: "",
}

/**
 * Counter Store for Stream Death Counter
 */
const useCounterStore = Pinia.defineStore('counter', {
  state() {
    return {
      value: 0
    }
  },
  actions: {
    increment(state) {
      this.value++
    },
    decrement(state) {
      this.value--
    },
    clear(state) {
      this.valie = 0;
    }
  }
})

/**
 * Generate a Toastify.js Notification
 * @param {*} text The Text to be displayed in the toast
 * @param {*} duration the duration the toast will be displayed on screen
 * @param {*} style the css style for the toast notification
 */
function GenerateToastify(text, duration, style, avatar) {
  Toastify({
    text,
    duration,
    style,
    avatar,
    offset: {
      x: 0, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
      y: 35, // vertical axis - can be a number or a string indicating unity. eg: '2em'
    },
  }).showToast();
}

/**
 * Construction of Vue 3 App
 * This is the apps main entry point which gets injected into
 * <div id="q-app">...</div> in HTML
 */
const app = Vue.createApp({
  setup() {
    const CounterStore = useCounterStore();
    
    // Setup event listener for Widget Load
    // window.addEventListener('onWidgetLoad' (obj) => {

    // })

    return {
      CounterStore
    };
  },
});

app.use(Pinia.PiniaVuePlugin)

/**
 * Operating System Bar
 */
app.component('bar', {
  setup() {
    return {

    };
  },
  template: `
    <!-- Bar Background -->
    <div class="bar">
    </div>

    <!-- Network Symbol -->
    <!-- Idea - Have network symbol flash / change color
        between white and light grey to indicate activity -->
    <q-icon name="mdi-wan" class="network" color="white" size="25px"></q-icon>

    <!-- Recent Followers Symbol -->
    <q-icon name="mdi-account-heart" class="followers" color="white" size="25px"></q-icon>

    <!-- Clock -->
    <clock></clock>

    <!-- Notification Icon -->
    <q-icon name="mdi-message-outline" class="notification" color="white" size="25px"></q-icon>

    <div><h1>{{value}}</h1></div>
  `,
});

/**
 * Toast notifications for Events Listener
 * https://github.com/apvarun/toastify-js
 */
app.component('notifications', {
  setup() {
    window.addEventListener('onEventReceived', (obj) => {

      // Follower Event
      if (obj.detail.listener === 'follower-latest') {
        GenerateToastify(`Thank you for following ${obj.detail.event.name}`, 5000, { background: 'blue' }, 'https://www.twitch.tv/p/legal/assets/images/extensions/6.svg');
      }

      // Subscriber Event
      if (obj.detail.listener === 'subscriber-latest') {
        GenerateToastify(`Thank you for subscribing ${obj.detail.event.name}`, 5000, { color: 'black', background: 'white' });
      }

      if (obj.detail.listener === 'host-latest') {
        GenerateToastify(`Thank you for hosting ${obj.detail.event.name}`, 5000, { color: 'white', background: 'red' });
      }

      if (obj.detail.listener === 'tip-latest') {
        GenerateToastify(`Thank you for tipping ${obj.detail.event.name}`, 5000, { color: 'black', background: 'lime' });
      }

      if (obj.detail.listener === 'raid-latest') {
        GenerateToastify(`Thank you for raiding ${obj.detail.event.name}`, 5000, { color: 'white', background: 'DeepPink' });
      }

    });

    return {
      //
    };
  },
});

/**
 * Overlay Bar's Clock Component
 * Displaying Local time to the User viewing the Overlay
 * Format: 00:00:00 - HH-MM-SS
 */
app.component('clock', {
  setup() {
    const osTime = ref('');

    setInterval(() => {
      const dateTime = new Date();
      osTime.value = dateTime.toLocaleTimeString();
    }, 1000);

    return {
      osTime,
    };
  },
  template: `
    <div class="time">
      {{osTime}}
    </div>
  `,
});








app.use(Quasar, { config: {} });
app.mount('#q-app');
