
// Data
let userOptions = {
  channelName: "",
};
// Commands

// Counter
const CounterIncrement = "!c+"
const CounterDecrement = "!c-"
const CounterClear = "!cc"

/**
 * Counter Store for Stream Death Counter
 */
 const useCounterStore = Pinia.defineStore('counter', {
  state() {
    return {
      isActive: false,
      value: 0,
    }
  },
  actions: {
    increment(state) {
      this.value++
      this.isActive = true;
    },
    decrement(state) {
      this.value--
      this.isActive = true;
    },
    clear(state) {
      this.value = 0;
      this.isActive = false;
    }
  }
})

/**
 * Sanitize any Text coming from HTML Events
 */
function html_encode(e) {
  return e.replace(/[\<\>\"\^]/g, function (e) {
      return "&#" + e.charCodeAt(0) + ";";
  });
}

/**
 * ChatCommandHandler
 */
function ChatCommandHandler(user, userState, message) {
  const counterStore = useCounterStore();

  console.log("Message", message);
  console.log("User State: IsMod", userState.mod, userState.badges.broadcaster);

  console.log("isIncrement", message === CounterIncrement)
  console.log("isDecrement", message === CounterDecrement)
  console.log("isClear", message === CounterClear)

  
  // Counter Commandss
  if (message === CounterIncrement && (userState.mod || userState.badges.broadcaster)) {
    console.log("incrementing")
    counterStore.increment();
  }

  if (message === CounterDecrement && (userState.mod || userState.badges.broadcaster)) {
    console.log("decrementing")
    counterStore.decrement();
  }

  if (message === CounterClear && (userState.mod || userState.badges.broadcaster)) {
    console.log("clearing")
    counterStore.clear();
  }
}

/**
 * EventsHandler
 * Triggers when Streamelements fires off 'onEventReceived'
 * @param {*} obj Stream Elements Object when events fire
 */
function EventsHandler(obj) {
    console.log("EventName", obj);

    // Handle Chat Messages
    if (obj.detail.listener === "message") {

      // Sanitize the Input
      const data = obj.detail.event.data;

      // Get Data Elements
      const message = html_encode(data.text);
      const user = data.nick;
      const userState = {
        mod: parseInt(data.tags.mod),
        badges: {
          broadcaster: (user === userOptions.channelName)
        }
      }

      ChatCommandHandler(user, userState, message)
    }
}



/**
 * Construction of Vue 3 App
 * This is the apps main entry point which gets injected into
 * <div id="q-app">...</div> in HTML
 */
const app = Vue.createApp({
  setup() {
    const CounterStore = useCounterStore();

    // Setup an event listener for Streamelements widget onload
    window.addEventListener('onWidgetLoad', function (obj) {
      userOptions.channelName = obj.detail.channel.username;
    });
      
    // Setup an event listener for Streamelements events
    window.addEventListener('onEventReceived', function (obj) {
      EventsHandler(obj);
    });

    function onFirstPageClick() {
      CounterStore.increment();
    }
  
    return {
      CounterStore,
      onFirstPageClick
    };
  },
});

// Setup Pinia for use
const pinia = Pinia.createPinia();
app.use(pinia)

// Setup Quasar for use
app.use(Quasar, { config: {} });

// Finally Mount the Application
app.mount('#q-app');