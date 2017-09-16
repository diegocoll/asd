<template>
  <v-app light>
    <v-navigation-drawer
      persistent
      :clipped="true"

      v-model="drawer"
      enable-resize-watcher
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in items"
          :key="i"
        >
          <v-list-tile-action>
            <v-icon light v-html="item.icon"></v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.title"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed>

      <v-toolbar-side-icon @click.stop="drawer = !drawer" light></v-toolbar-side-icon>

      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>

    </v-toolbar>

    <main>
      <v-container fluid>

          <v-layout column align-center>
            <h3>IP/PORT - UDP: 35.198.8.140:4444</h3>
            <div v-for="reporte, i in reportes">
              <blockquote>
                <b>{{i}}</b> &mdash;
                {{reporte.rep}}
                <footer>
                  <small>
                    <em>&mdash; fecha de recepcion: {{reporte.fecha}} </em>
                  </small>
                </footer>
              </blockquote>
              <br>
            </div>
            <!-- <block-quote></block-quote> -->
          </v-layout>
        <!--
        <router-view></router-view>
         -->
      </v-container>
    </main>

  </v-app>
</template>

<script>
  //import Blockquote from "@/components/Blockquote"
  export default {
    components:{
      //BlockQuote:"Blockquote"
    },
    data () {
      return {
        reportes: [],
        drawer: true,
        items: [
          { icon: 'developer_board', title: 'Placa 001' },
          { icon: 'developer_board', title: 'Placa 002' },
          { icon: 'developer_board', title: 'Placa 003' }
        ],
        title: 'LARTEC - Plataforma de prueba',
      }
    },
    sockets:{
      connect: function(){
        console.log('socket connected')
      },
      // customEmit: function(val){
      //   console.log('this method was fired by the socket server. eg: io.emit("customEmit", data)')
      // },
      data_method: function(report){
        //console.log(report);
        var instante = new Date();
        var temp = {
          rep: report,
          fecha: instante
        };
        this.reportes.push(temp);
      }
    },
    methods: {
      // clickButton: function(val){
      //     // $socket is socket.io-client instance
      //     this.$socket.emit('emit_method', val);
      //   }
    }
  }
</script>
