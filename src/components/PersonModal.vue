<template>
  <v-dialog v-model="internalIsOpen" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="headline">{{ modalTitle }}</span>
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="person.nome"
            :rules="getRules('nome')"
            label="Nome"
            :readonly="mode === 'view'"
            required
          ></v-text-field>
          <v-text-field
            v-model="person.nome_social"
            :rules="getRules('nome_social')"
            label="Nome Social"
            :readonly="mode === 'view'"
          ></v-text-field>
          <v-text-field
            v-model="person.cpf"
            :rules="getRules('cpf')"
            label="CPF"
            :readonly="mode === 'view'"
            required
            @input="formatCPF"
            maxlength="14"
            @keypress="validateNumber"
          ></v-text-field>
          <v-text-field
            v-model="person.nome_pai"
            :rules="getRules('nome_pai')"
            label="Nome do Pai"
            :readonly="mode === 'view'"
          ></v-text-field>
          <v-text-field
            v-model="person.nome_mae"
            :rules="getRules('nome_mae')"
            label="Nome da Mãe"
            :readonly="mode === 'view'"
          ></v-text-field>
          <v-text-field
            v-model="person.telefone"
            :rules="getRules('telefone')"
            label="Telefone"
            :readonly="mode === 'view'"
            @input="formatTelefone"
            maxlength="15"
            @keypress="validateNumber"
          ></v-text-field>
          <v-text-field
            v-model="person.email"
            :rules="getRules('email')"
            label="Email"
            :readonly="mode === 'view'"
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-subtitle v-if="mode !== 'view'">Endereços</v-card-subtitle>
      <v-card-text>
        <v-form ref="addressForm" v-model="addressValid" v-if="mode !== 'view'">
          <v-radio-group v-model="address.tipo" :rules="[rules.required]" row>
            <v-radio label="Residencial" value="Residencial"></v-radio>
            <v-radio label="Comercial" value="Comercial"></v-radio>
          </v-radio-group>
          <v-text-field
            v-model="address.cep"
            :rules="[rules.required, rules.cep]"
            label="CEP"
            @input="fetchAddress"
            maxlength="8"
            @keypress="validateNumber"
          ></v-text-field>
          <v-text-field
            v-model="address.logradouro"
            :rules="[rules.required]"
            label="Logradouro"
            readonly
          ></v-text-field>
          <v-text-field
            v-model="address.numero"
            :rules="[rules.required, rules.maxLength(20)]"
            label="Número"
            maxlength="20"
            @keypress="validateNumber"
          ></v-text-field>
          <v-text-field
            v-model="address.complemento"
            :rules="[rules.maxLength(50)]"
            label="Complemento"
            maxlength="50"
          ></v-text-field>
          <v-text-field
            v-model="address.bairro"
            :rules="[rules.required]"
            label="Bairro"
            readonly
          ></v-text-field>
          <v-text-field
            v-model="address.estado"
            :rules="[rules.required]"
            label="Estado"
            readonly
          ></v-text-field>
          <v-text-field
            v-model="address.cidade"
            :rules="[rules.required]"
            label="Cidade"
            readonly
          ></v-text-field>
          <v-btn :disabled="!addressValid" @click="addAddress">Adicionar Endereço</v-btn>
        </v-form>
        <v-data-table
          :headers="addressHeaders"
          :items="person.enderecos"
          item-key="cep"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr v-for="item in items" :key="item.cep">
                <td>{{ item.tipo }}</td>
                <td>{{ item.cep }}</td>
                <td>{{ item.logradouro }}</td>
                <td>{{ item.numero }}</td>
                <td>{{ item.complemento }}</td>
                <td>{{ item.bairro }}</td>
                <td>{{ item.estado }}</td>
                <td>{{ item.cidade }}</td>
                <td v-if="mode !== 'view'">
                  <v-btn icon @click="openEditAddressModal(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon @click="confirmDeleteAddress(item)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" text @click="closeModal">Fechar</v-btn>
        <v-btn color="blue darken-1" text @click="validateAndConfirmSubmit" v-if="mode !== 'view'">Salvar</v-btn>
      </v-card-actions>
    </v-card>
    <v-dialog v-model="isEditAddressModalOpen" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">Editar Endereço</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="editAddressForm" v-model="editAddressValid">
            <v-select
              v-model="editAddress.tipo"
              :items="['Residencial', 'Comercial']"
              :rules="getRules('tipo')"
              label="Tipo"
              required
            ></v-select>
            <v-text-field v-model="editAddress.cep" :rules="getRules('cep')" label="CEP" @input="fetchEditAddress" maxlength="8" @keypress="validateNumber"></v-text-field>
            <v-text-field v-model="editAddress.logradouro" :rules="getRules('logradouro')" label="Logradouro" readonly></v-text-field>
            <v-text-field v-model="editAddress.numero" :rules="getRules('numero')" label="Número" maxlength="20" @keypress="validateNumber"></v-text-field>
            <v-text-field v-model="editAddress.complemento" label="Complemento" maxlength="50"></v-text-field>
            <v-text-field v-model="editAddress.bairro" :rules="getRules('bairro')" label="Bairro" readonly></v-text-field>
            <v-text-field v-model="editAddress.estado" :rules="getRules('estado')" label="Estado" readonly></v-text-field>
            <v-text-field v-model="editAddress.cidade" :rules="getRules('cidade')" label="Cidade" readonly></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeEditAddressModal">Cancelar</v-btn>
          <v-btn color="blue darken-1" text @click="confirmEditAddress">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      <v-progress-circular indeterminate size="64" color="blue"></v-progress-circular>
    </v-overlay>
  </v-dialog>
</template>

<script>
import api from '@/services/api';

export default {
  props: {
    isOpen: Boolean,
    mode: String, // 'create', 'edit', 'view'
    personData: Object
  },
  data() {
    return {
      internalIsOpen: this.isOpen,
      isEditAddressModalOpen: false,
      isConfirmDialogOpen: false,
      isProcessing: false,
      valid: false,
      addressValid: false,
      editAddressValid: false,
      showErrors: false,
      person: {
        nome: '',
        nome_social: '',
        cpf: '',
        nome_pai: '',
        nome_mae: '',
        telefone: '',
        email: '',
        enderecos: []
      },
      address: {
        tipo: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        cidade: ''
      },
      editAddress: {
        id: null,
        tipo: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        cidade: ''
      },
      confirmDialogTitle: '',
      confirmDialogMessage: '',
      confirmAction: null,
      snackbar: {
        show: false,
        message: '',
        color: ''
      },
      addressHeaders: [
        { text: 'Tipo', value: 'tipo' },
        { text: 'CEP', value: 'cep' },
        { text: 'Logradouro', value: 'logradouro' },
        { text: 'Número', value: 'numero' },
        { text: 'Complemento', value: 'complemento' },
        { text: 'Bairro', value: 'bairro' },
        { text: 'Estado', value: 'estado' },
        { text: 'Cidade', value: 'cidade' },
        { text: 'Ações', value: 'actions', sortable: false }
      ],
      rules: {
        required: value => !!value || 'Campo obrigatório',
        email: value => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Email inválido',
        cpf: value => !value || /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(value) || 'CPF deve ter o formato xxx.xxx.xxx-xx',
        maxLength: length => value => !value || value.length <= length || `Máximo de ${length} caracteres`,
        cep: value => !value || /^\d{8}$/.test(value) || 'CEP deve ter 8 dígitos',
        telefone: value => !value || /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value) || 'Telefone deve ter o formato (xx) xxxxx-xxxx'
      }
    };
  },
  watch: {
    isOpen(val) {
      this.internalIsOpen = val;
      if (val && this.mode !== 'create') {
        this.setPersonFromTable();
      } else if (val && this.mode === 'create') {
        this.resetPerson();
      }
    },
    internalIsOpen(val) {
      if (!val) {
        this.$emit('close');
      }
    },
    'address.cep'(val) {
      if (val.length === 8) {
        this.fetchAddress();
      }
    },
    'editAddress.cep'(val) {
      if (val.length === 8) {
        this.fetchEditAddress();
      }
    },
    personData: {
      handler(newData) {
        if (newData) {
          this.person = { ...newData };
        }
      },
      deep: true
    }
  },
  methods: {
    getRules(field) {
      return this.showErrors ? this.rules[field] : [];
    },
    validateNumber(event) {
      const key = event.key;
      if (!/^\d$/.test(key)) {
        event.preventDefault();
      }
    },
    resetPerson() {
      this.person = {
        nome: '',
        nome_social: '',
        cpf: '',
        nome_pai: '',
        nome_mae: '',
        telefone: '',
        email: '',
        enderecos: []
      };
      this.resetAddressForm();
    },
    setPersonFromTable() {
      if (this.personData) {
        this.person = { ...this.personData };
      }
    },
    formatCPF() {
      let cpf = this.person.cpf.replace(/\D/g, '');
      if (cpf.length > 3) cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
      if (cpf.length > 7) cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
      if (cpf.length > 11) cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      this.person.cpf = cpf;
    },
    formatTelefone() {
      let telefone = this.person.telefone.replace(/\D/g, '');
      if (telefone.length > 2) telefone = telefone.replace(/(\d{2})(\d)/, '($1) $2');
      if (telefone.length > 7) telefone = telefone.replace(/(\d{5})(\d)/, '$1-$2');
      this.person.telefone = telefone;
    },
    async fetchAddress() {
      if (this.address.cep.length === 8) {
        try {
          const response = await api.get(`https://viacep.com.br/ws/${this.address.cep}/json/`);
          if (response.data.erro) {
            throw new Error('CEP não encontrado');
          }
          this.address.logradouro = response.data.logradouro;
          this.address.bairro = response.data.bairro;
          this.address.estado = response.data.uf;
          this.address.cidade = response.data.localidade;
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
        }
      }
    },
    async fetchEditAddress() {
      if (this.editAddress.cep.length === 8) {
        try {
          const response = await api.get(`https://viacep.com.br/ws/${this.editAddress.cep}/json/`);
          if (response.data.erro) {
            throw new Error('CEP não encontrado');
          }
          this.editAddress.logradouro = response.data.logradouro;
          this.editAddress.bairro = response.data.bairro;
          this.editAddress.estado = response.data.uf;
          this.editAddress.cidade = response.data.localidade;
        } catch (error) {
          console.error('Erro ao buscar endereço:', error);
        }
      }
    },
    addAddress() {
      this.showErrors = true;
      if (this.$refs.addressForm.validate()) {
        const newAddress = { ...this.address };
        this.person.enderecos.push(newAddress);
        this.resetAddressForm();
        this.showErrors = false;
      } else {
        this.showSnackbar('Preencha todos os campos obrigatórios do endereço!', 'error');
      }
    },
    resetAddressForm() {
      this.address = {
        tipo: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        estado: '',
        cidade: ''
      };
      this.$refs.addressForm.reset();
    },
    openEditAddressModal(address) {
      this.editAddress = { ...address };
      this.isEditAddressModalOpen = true;
    },
    closeEditAddressModal() {
      this.isEditAddressModalOpen = false;
    },
    async confirmEditAddress() {
      if (this.$refs.editAddressForm.validate()) {
        const index = this.person.enderecos.findIndex(a => a.id === this.editAddress.id);
        if (index !== -1) {
          try {
            this.isProcessing = true;
            this.isEditAddressModalOpen = false;
            await api.put(`/enderecos/${this.editAddress.id}`, this.editAddress);
            this.person.enderecos.splice(index, 1, { ...this.editAddress });
            this.showSnackbar('Endereço atualizado com sucesso!', 'success');
          } catch (error) {
            this.showSnackbar('Erro ao atualizar endereço!', 'error');
            console.error('Erro ao atualizar endereço:', error);
          } finally {
            this.isProcessing = false;
          }
        }
        this.isEditAddressModalOpen = false;
      }
    },
    async deleteAddress(address) {
    const index = this.person.enderecos.indexOf(address);
      if (index > -1) {
        if (address.id) {
          this.isProcessing = true;
          this.isConfirmDialogOpen = false;
          try {
            await api.delete(`/enderecos/${address.id}`);
            this.showSnackbar('Endereço excluído com sucesso!', 'success');
          } catch (error) {
            this.showSnackbar('Erro ao excluir endereço!', 'error');
            console.error('Erro ao excluir endereço:', error);
          } finally {
            this.isProcessing = false;
          }
        }
        this.person.enderecos.splice(index, 1);
      }
      this.isConfirmDialogOpen = false;
    },
    confirmDeleteAddress(address) {
      this.confirmDialogTitle = 'Confirmar Exclusão';
      this.confirmDialogMessage = 'Você tem certeza que deseja excluir este endereço?';
      this.confirmAction = () => this.deleteAddress(address);
      this.isConfirmDialogOpen = true;
    },
    validateAndConfirmSubmit() {
      this.showErrors = true;
      if (this.$refs.form.validate()) {
        this.confirmDialogTitle = 'Confirmar Submissão';
        this.confirmDialogMessage = 'Você tem certeza que deseja salvar estas alterações?';
        this.confirmAction = this.submit;
        this.isConfirmDialogOpen = true;
      }
    },
    async submit() {
      this.isConfirmDialogOpen = false;
      this.isProcessing = true;
      const personData = {
        ...this.person,
        cpf: this.person.cpf.replace(/\D/g, ''),
        telefone: this.person.telefone.replace(/\D/g, '')
      };
      try {
        if (this.mode === 'create') {
          const response = await api.post('/pessoas', personData);
          this.showSnackbar('Pessoa criada com sucesso!', 'success');
          this.person.id = response.data.id;
          await this.submitAddresses();
        } else if (this.mode === 'edit') {
          await api.put(`/pessoas/${this.person.id}`, personData);
          this.showSnackbar('Pessoa atualizada com sucesso!', 'success');
          await this.submitAddresses();
        }
        this.internalIsOpen = false;
        this.$emit('close');
      } catch (error) {
        console.error('Erro ao salvar pessoa:', error);
        this.showSnackbar('Erro ao salvar pessoa!', 'error');
      } finally {
        this.isProcessing = false;
      }
    },
    async submitAddresses() {
      for (const address of this.person.enderecos) {
        if (!address.id) {
          await api.post(`/pessoas/${this.person.id}/enderecos`, address);
          this.showSnackbar('Endereço cadastrado com sucesso', 'success');
        } else {
          await api.put(`/enderecos/${address.id}`, address);
        }
      }
    },
    closeModal() {
      this.internalIsOpen = false;
      this.$emit('close');
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
    if (this.isOpen && this.mode !== 'create') {
      this.setPersonFromTable();
    }
  },
  computed: {
    modalTitle() {
      if (this.mode === 'view') return 'Visualizar Pessoa';
      if (this.mode === 'edit') return 'Editar Pessoa';
      return 'Cadastrar Pessoa';
    }
  }
};
</script>

<style>
.v-overlay__scrim {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 3000;
}
</style>

