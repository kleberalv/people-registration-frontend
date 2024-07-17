<template>
  <v-container>
    <v-row>
      <v-col>
        <v-text-field
          v-model="search"
          label="Pesquisar por nome, CPF ou ID"
          @input="filterTable"
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="openModal('create')">Nova Pessoa</v-btn>
      </v-col>
    </v-row>
    <v-data-table
      :headers="headers"
      :items="filteredPeople"
      item-key="id"
    >
      <template v-slot:body="{ items }">
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.id }}</td>
            <td>{{ item.nome }}</td>
            <td>{{ item.cpf }}</td>
            <td>
              <v-btn icon @click="openModal('view', item.id)">
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              <v-btn icon @click="openModal('edit', item.id)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="confirmDeletePerson(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>

    <PersonModal
      :isOpen="isModalOpen"
      :mode="modalMode"
      :personId="selectedPersonId"
      @close="closeModal"
    />

    <v-dialog v-model="isConfirmDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ confirmDialogTitle }}</span>
        </v-card-title>
        <v-card-text>{{ confirmDialogMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeConfirmDialog">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click="performConfirmAction">Confirmar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
    <v-overlay :value="isProcessing" absolute>
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import api from '@/services/api';
import PersonModal from '@/components/PersonModal.vue';

export default {
  components: {
    PersonModal
  },
  data() {
    return {
      search: '',
      isModalOpen: false,
      modalMode: 'create',
      selectedPersonId: null,
      isConfirmDialogOpen: false,
      isProcessing: false,
      confirmDialogTitle: '',
      confirmDialogMessage: '',
      confirmAction: null,
      snackbar: {
        show: false,
        message: '',
        color: ''
      },
      headers: [
        { text: 'ID', value: 'id' },
        { text: 'Nome', value: 'nome' },
        { text: 'CPF', value: 'cpf' },
        { text: 'Ações', value: 'actions', sortable: false }
      ],
      people: [],
      filteredPeople: []
    };
  },
  methods: {
    async fetchPeople() {
      try {
        const response = await api.get('/pessoas');
        this.people = response.data;
        this.filteredPeople = this.people;
      } catch (error) {
        console.error('Erro ao buscar pessoas:', error);
      }
    },
    openModal(mode, id = null) {
      this.modalMode = mode;
      this.selectedPersonId = id;
      this.isModalOpen = true;
    },
    closeModal() {
      this.isModalOpen = false;
      this.fetchPeople();
    },
    filterTable() {
      const searchLower = this.search.toLowerCase();
      this.filteredPeople = this.people.filter(person =>
        person.nome.toLowerCase().includes(searchLower) ||
        person.cpf.includes(this.search) ||
        person.id.toString().includes(this.search)
      );
    },
    confirmDeletePerson(id) {
      this.confirmDialogTitle = 'Confirmar Exclusão';
      this.confirmDialogMessage = 'Você tem certeza que deseja excluir esta pessoa?';
      this.confirmAction = () => this.deletePerson(id);
      this.isConfirmDialogOpen = true;
    },
    async deletePerson(id) {
      this.isProcessing = true;
      try {
        await api.delete(`/pessoas/${id}`);
        this.fetchPeople();
        this.showSnackbar('Pessoa excluída com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao excluir pessoa:', error);
        this.showSnackbar('Erro ao excluir pessoa!', 'error');
      } finally {
        this.isProcessing = false;
        this.isConfirmDialogOpen = false;
      }
    },
    closeConfirmDialog() {
      this.isConfirmDialogOpen = false;
    },
    performConfirmAction() {
      if (this.confirmAction) {
        this.confirmAction();
      }
    },
    showSnackbar(message, color) {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    }
  },
  mounted() {
    this.fetchPeople();
  }
};
</script>
