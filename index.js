const { app, Menu, Tray, dialog } = require("electron");
const { basename, resolve } = require("path");

const fixPath = require("fix-path");
const Store = require("electron-store");
const { spawn } = require("child_process");

fixPath();

const schema = {
  projects: {
    type: "string",
  },
};

let mainTray = {};

const store = new Store({ schema });

function render(tray = mainTray){
  const storedProjects = store.get('projects');
  const projects = storedProjects ? JSON.parse(storedProjects) : [];
  let status;

  const items = projects.map(({ name, path }) => ({
    label: name,
    icon: resolve(__dirname,'assets', 'codigoGoogle16px.png'),
    submenu: [
      {
        label: "Abrir",
        icon: resolve(__dirname,'assets', 'vscode16px.png'),
        click: () => {
          spawn('code', [path], { shell: true });
        },
      },

      {
        label: "Remover",
        icon: resolve(__dirname,'assets', 'excluirPasta16px.png'),
        click: () => {
          store.set(
            'projects',
            JSON.stringify(projects.filter(item => item.path !== path)),
          );
          render();
        }
      }
    ]
  }));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Adicionar projeto",
      icon: resolve(__dirname,'assets', 'novaPasta16px.png'),
      click: async () => {
        try {
            const result = await dialog.showOpenDialog({properties: ['openDirectory']}) 
            status = result.canceled;
            [path] = result.filePaths;
        } catch(error) {
            console.log(error)
        }
        
        const name = basename(path);
        // path é o caminho
        // name é o nome do projeto

        store.set(
          'projects',
          JSON.stringify([
            ...projects,
            {
              path,
              name,
            },
          ])
        );
        
        render();
      }
    },

    {
      type: "separator",
    },
    ...items,
    {
      type: "separator"
    },

    {
      type: "normal",
      label: "Sair",
      role: "quit",
      icon: resolve(__dirname,'assets', 'fecharJanela16px.png'),
      enabled: true,
    }
  
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("click", tray.popUpContextMenu);
}

app.on("ready", () => {
  mainTray = new Tray(resolve(__dirname,'assets', 'trayIcon.png'));
  render(mainTray)
});
