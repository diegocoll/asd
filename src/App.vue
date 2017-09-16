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
            <blockquote>
              &#8220;First, solve the problem. Then, write the code.&#8221;
              <footer>
                <small>
                  <em>&mdash; hora de recepcion </em>
                </small>
              </footer>
            </blockquote>
            <br>
            <blockquote>
              &#8220;First, solve the problem. Then, write the code.&#8221;
              <footer>
                <small>
                  <em>&mdash; hora de recepcion </em>
                </small>
              </footer>
            </blockquote>
            <br>
            <blockquote>
              &#8220;First, solve the problem. Then, write the code.&#8221;
              <footer>
                <small>
                  <em>&mdash; hora de recepcion </em>
                </small>
              </footer>
            </blockquote>
            <block-quote></block-quote>
          </v-layout>
        <!--
        <router-view></router-view>
         -->
      </v-container>
    </main>

  </v-app>
</template>

<script>
  import Blockquote from "@/components/Blockquote"
  export default {
    components:{
      BlockQuote:"Blockquote"
    },
    data () {
      return {
        drawer: true,
        items: [
          { icon: 'developer_board', title: 'Placa 001' },
          { icon: 'developer_board', title: 'Placa 002' },
          { icon: 'developer_board', title: 'Placa 003' },
          { icon: 'developer_board', title: 'Placa 004' },
          { icon: 'developer_board', title: 'Placa 005' }
        ],
        title: 'LARTEC - Plataforma de prueba',
      }
    }
  }
</script>
