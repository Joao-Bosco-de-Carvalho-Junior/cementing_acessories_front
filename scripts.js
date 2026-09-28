/* TO DO

EXTRAS:
Lista de objetos dentro de detalhes serem clicáveis
Commit GitHub
Pegar última análise e ver status aprovação
Commit GitHub
Botão ir e voltar e histórico
Commit GitHub
Login de usuários
Commit GitHub
Modal de confirmação
Commit GitHub
Toasts avisos
Commit GitHub 
Card em acessórios


*/

/*
  --------------------------------------------------------------------------------------
  Mapeamento de objetos
  --------------------------------------------------------------------------------------
*/

//Mapeamento de listagem de objetos
const objectListMapping = {
  "Usuários": "users",
  "Poços": "wells",
  "Acessórios": "accessories"
};

//Mapeamento de objetos individuais
const objectMapping = {
  "Usuários": "user",
  "Poços": "well",
  "Acessórios": "accessory",
  "Analisar Acessórios": "user/accessory",
  "Analisar Poços": "well/accessory"
};

/*
  --------------------------------------------------------------------------------------
  Navegação e carregamento das listas
  --------------------------------------------------------------------------------------
*/

const ListElement = () => {
  let lis = document.getElementsByClassName("nav-item");
  let i;
  for (i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
      getObjectList(this.textContent);
    };
  }
};

const getObjectList = async (objectType = document.getElementById('object').textContent) => {
  const url = `http://127.0.0.1:5000/${objectListMapping[objectType]}`;
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      const listItems = document.createDocumentFragment();
      data[objectListMapping[objectType]].forEach(item => {
        insertObjectList(item, listItems);
      });
      document.getElementById('object').textContent = objectType;
      document.getElementById('mainList').replaceChildren(listItems);
      document.getElementById('mainList').hidden = false;
      document.getElementById('formSection').hidden = true;
      document.getElementById('detailsSection').hidden = true;
      removeElement();
      viewElement();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
};


const insertObjectList = (item, list = document.getElementById('mainList')) => {
  var li = document.createElement('li');
  list.appendChild(li);
  let objectType = document.getElementById('object').textContent;
  if (objectType === "Acessórios") {
    li.textContent = `${item.name} do tipo ${item.type} da ${item.manufacturer}. NM: ${item.id}`
    li.id = item.id; 
  }
  else {
    li.textContent = item.name;
    li.id = item.id; 
  }
  
  li.className = "item";

  insertButton(li)
}

const viewElement = () => {
  let lis = document.getElementsByClassName("item");
  let i;
  for (i = 0; i < lis.length; i++) {
    lis[i].onclick = function () {
      getObject(this.id);
    }
  }
}

/*
  --------------------------------------------------------------------------------------
  Formulários
  --------------------------------------------------------------------------------------
*/


// Campos usados na criação e edição de cada tipo de recurso.
const accessoryFields = [
  'accessory_type',
  'casing_size',
  'external_use_cases',
  'manufacturer',
  'name',
  'outer_diameter'
];

const centralizerFields = accessoryFields.concat([
  'restoring_force',
  'running_force',
  'type',
  'well_diameter'
]);

const userAndWellFields = [
  'name',
];

const userAnalyzeAccessoryFields = [
  'accessory_id',
  'user_id',
  'comment',
  'approval'
];

const wellUseAccessoryFields = [
  'well_id',
  'accessory_id',
  'comment',
  'anomaly'
]

const objectFormMapping = {
  "Usuários": userAndWellFields,
  "Poços": userAndWellFields,
  "Acessórios": centralizerFields,
  "Analisar Acessórios": userAnalyzeAccessoryFields,
  "Analisar Poços": wellUseAccessoryFields
};

// Formatação e renderização dos dados de formulário e detalhes
const formatFieldName = (fieldName) => fieldName.replace(/_/g, ' ');

const formatFieldValue = (value) => {
  if (value == null) return '-';
  if (Array.isArray(value)) {
    return value.map(formatFieldValue).join('\n');
  }
  if (
    typeof value === 'object' && document.getElementById('object').textContent === 'Acessórios' && 'approval' in value
  ) {
    return `${value.name} ${value.approval ? '' : 'não'} aprovou. Comentário: ${value.comment ?? '-'}`;
  }
  else if (
    typeof value === 'object' && 'anomaly' in value
  ) {
    return `${value.name} ${value.anomaly ? '' : 'não'} apresentou anomalia. Comentário: ${value.comment ?? '-'}`;
  }
  else if (
    typeof value === 'object' && 'manufacturer' in value
  ) {
    return `${value.name} do fabricante ${value.manufacturer} ${value.approval ? '' : 'não'} foi aprovado. Comentário: ${value.comment ?? '-'}`;
  }
  return String(value);
};

const getInputType = (fieldName) => {
  if (fieldName.toLowerCase().includes('date')) return 'date';
  if (
    fieldName.endsWith('_id') ||
    ['casing_size', 'outer_diameter', 'restoring_force', 'running_force'].includes(fieldName)
  ) return 'number';
  if (fieldName === 'approval' || fieldName === 'anomaly') return 'checkbox';
  return 'text';
};

const renderObjectFields = (container, object) => {
  container.replaceChildren();

  Object.entries(object).forEach(([fieldName, value]) => {
    const label = document.createElement('dt');
    const content = document.createElement('dd');
    label.textContent = formatFieldName(fieldName);
    content.textContent = formatFieldValue(value);
    container.append(label, content);
  });
}

const showObjectForm = (editingObject = null) => {
  const form = document.getElementById('resourceForm');
  form.replaceChildren();

  if (editingObject) {
    const idInput = document.createElement('input');
    idInput.type = 'hidden';
    idInput.name = 'id';
    idInput.id = 'id';
    idInput.value = editingObject.id;
    form.appendChild(idInput);
  }

  const objectType = document.getElementById('object').textContent;
  const objectFields = objectFormMapping[objectType];
  objectFields.forEach((fieldName) => {
    const field = document.createElement('div');
    const label = document.createElement('label');
    const input = document.createElement('input');
    label.htmlFor = fieldName;
    label.textContent = formatFieldName(fieldName);
    input.id = fieldName;
    input.name = fieldName;
    input.type = getInputType(fieldName);
    if (input.type === 'checkbox') {
      input.value = 'true';
      input.checked = [true, 1, '1', 'true'].includes(editingObject?.[fieldName]);
    } else {
      input.value = editingObject?.[fieldName] ?? '';
    }
    input.required = input.type !== 'checkbox';
    field.className = 'form-field';
    field.append(label, input);
    form.appendChild(field);
  });
  form.addEventListener('formdata', (event) => {
    objectFields.forEach((fieldName) => {
      const input = form.elements.namedItem(fieldName);
      if (input.type === 'checkbox' && !input.checked) {
        event.formData.append(fieldName, 'false');
      }
    });
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Salvar';
  submit.className = 'btn-primary';
  submit.id = 'submitCreateButton';
  form.appendChild(submit);
  form.onsubmit = editingObject
    ? (event) => updateObject(event, editingObject.id)
    : createObject;
  document.getElementById('formSection').hidden = false;
  document.getElementById('detailsSection').hidden = true;
  document.getElementById('mainList').hidden = true;
}

/*
  --------------------------------------------------------------------------------------
  Criação e atualização de objetos
  --------------------------------------------------------------------------------------
*/
const createObject = (event) => {
  event.preventDefault();
  const objectType = document.getElementById('object').textContent
  const form = event.currentTarget;
  fetch(`http://127.0.0.1:5000/${objectMapping[objectType]}`, {
    method: 'post',
    body: new FormData(form)
  })
    .then((response) => response.json())
    .then((data) => {
      form.reset();
      document.getElementById('formSection').hidden = true;
      console.log('Created object:', data.name, data.id);
      if (objectType === 'Analisar Acessórios') {
        document.getElementById('object').textContent = 'Acessórios';
        getObject(data.accessory_id);
      }
      else if (objectType === 'Analisar Poços') {
        document.getElementById('object').textContent = 'Poços';
        getObject(data.well_id);
      }
      else {
        getObject(data.id);
      }
    })
    .catch((error) => console.error('Error:', error));
}

const updateObject = (event) => {
  event.preventDefault();
  const objectType = document.getElementById('object').textContent
  const form = event.currentTarget;
  fetch(`http://127.0.0.1:5000/${objectMapping[objectType]}` , {
    method: 'PATCH',
    body: new FormData(form)
  })
    .then((response) => response.json())
    .then((data) => {
      form.reset();
      document.getElementById('formSection').hidden = true;
      console.log('Updated object:', data.name, data.id);
      getObject(data.id)
    })
    .catch((error) => console.error('Error:', error));
}

/*
  --------------------------------------------------------------------------------------
  Visualização de objetos
  --------------------------------------------------------------------------------------
*/

// Detalhes do recurso selecionado
const insertObject = (object) => {
  console.log('Inserting object:', object.name, object.id);
  const objectType = document.getElementById('object').textContent;
  let title = document.getElementById('detailsTitle');
  title.textContent = object.name;
  let detailsText = document.getElementById('detailsText');
  renderObjectFields(detailsText, object);
  let updateButton = document.getElementById('updateButton');
  updateButton.onclick = function() {
    showObjectForm(object);
  };
  let analyzeButton = document.getElementById('analyzeButton');
  analyzeButton.hidden = objectType === 'Usuários';
  analyzeButton.onclick = function() {
    let ele = document.getElementById('object')
    ele.textContent = 'Analisar ' + ele.textContent;
    showObjectForm();
  };
  document.getElementById('detailsSection').hidden = false;
  document.getElementById('mainList').hidden = true;
}

const getObject = (id) => {
  const objectType = document.getElementById('object').textContent;
  let url = `http://127.0.0.1:5000/${objectMapping[objectType]}?id=` + id;
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      insertObject(data)
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}


/*
  --------------------------------------------------------------------------------------
  Associação Poço-Acessório e Usuário-Acessório
  --------------------------------------------------------------------------------------
*/
const analyzeObject = (event) => {
  event.preventDefault();
  const objectType = document.getElementById('object').textContent
  const form = event.currentTarget;
  fetch(`http://127.0.0.1:5000/${objectMapping[objectType]}` , {
    method: 'PATCH',
    body: new FormData(form)
  })
    .then((response) => response.json())
    .then((data) => {
      form.reset();
      document.getElementById('formSection').hidden = true;
      console.log('Updated object:', data.name, data.id);
      getObject(data.id)
    })
    .catch((error) => console.error('Error:', error));
}

/*
  --------------------------------------------------------------------------------------
  Deleção de itens dos objetos
  --------------------------------------------------------------------------------------
*/

const insertButton = (parent) => {
  let span = document.createElement("span");
  let txt = document.createTextNode(" \u00D7");
  span.className = "close";
  span.appendChild(txt);
  parent.appendChild(span);
}

const removeElement = () => {
  let close = document.getElementsByClassName("close");
  let i;
  for (i = 0; i < close.length; i++) {
    close[i].onclick = async function (event) {
      event.stopPropagation();
      let li = this.parentElement;
      const idItem = li.id;
      if (confirm(`Você tem certeza de remover o item de ID ${idItem}?`)) {
        try {
          await deleteItem(idItem);
          li.remove();
          alert("Removido!");
        } catch (error) {
          console.error('Error:', error);
          alert(error.message);
        }
      }
    }
  }
}

const deleteItem = (item) => {
  let objectType = document.getElementById('object').textContent;
  let url = `http://127.0.0.1:5000/${objectMapping[objectType]}?id=` + item;
  return fetch(url, {
    method: 'delete'
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Não foi possível remover o item.');
      }

      return response.json();
    });
}

/*
  --------------------------------------------------------------------------------------
  Inicialização após o registro de funções e manipuladores.
  --------------------------------------------------------------------------------------
*/


document.getElementById('createButton').addEventListener('click', () => showObjectForm());
ListElement();
getObjectList();