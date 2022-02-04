const { useQuasar } = Quasar;
const { ref } = Vue;

/**
 * Construction of Vue 3 App
 * This is the apps main entry point which gets injected into
 * <div id="q-app">...</div> in HTML
 */
const app = Vue.createApp({
  setup() {
    const $q = useQuasar();

    const osTime = ref('');

    setInterval(() => {
      const dateTime = new Date();
      osTime.value = dateTime.toLocaleTimeString();
    }, 1000);

    window.addEventListener('onEventReceived', (obj) => {
      if (obj.detail.listener === 'follower-latest') {
        $q.notify({
          group: false,
          message: `Hey this worked ${obj.detail.event.name}`,
          position: 'top-right',
        });
      }
    });

    return {
      osTime,
    };
  },
});

// Clock Component
app.component('clock', {
  data() {
    return {

    };
  },
  template: `
    <h1>test</h1>
  `,
});

app.use(Quasar, { config: {} });
app.mount('#q-app');
