const { useQuasar } = Quasar
const { ref } = Vue


/*
Example kicking off the UI. Obviously, adapt this to your specific needs.
Assumes you have a <div id="q-app"></div> in your <body> above
*/
const app = Vue.createApp({
  setup() {
    const $q = useQuasar()

    const osTime = ref("")

    setInterval(() => {
      const dateTime = new Date();
      osTime.value = dateTime.toLocaleTimeString();
    }, 1000);



    window.addEventListener('onEventReceived', (obj) => {
      if (obj.detail.listener === "follower-latest") {
        $q.notify({
          group: false,
          message: `Hey this worked ${obj.detail.event.name}`,
          position: "top-right"
        })
      }
    });

    return {
      osTime
    }
  }
})


// Clock Component
const clock = app.component('clock', {
  data() {
    return {

    }
  },
  template: `
    <h1>test</h1>
  `
})

app.use(Quasar, { config: {} })
app.mount('#q-app')