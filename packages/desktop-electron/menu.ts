import { app, Menu } from 'electron';
import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';

export function getMenu() {
  const template: MenuItemConstructorOptions[] = [
    {
      label: '文件', // Kept purely for the keyboard shortcuts in Electron. Some shortcuts only work if they are in a menu (toggle devtools cannot be triggered in pure js).
      submenu: [
        {
          label: '退出',
          click(_item, focusedWindow) {
            if (focusedWindow) {
              const browserWindow = focusedWindow as BrowserWindow;
              browserWindow.close();
            }
          },
        },
      ],
    },
    {
      label: '视图',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click(_item, focusedWindow) {
            if (focusedWindow) {
              const browserWindow = focusedWindow as BrowserWindow;
              browserWindow.reload();
            }
          },
        },
        {
          label: '切换开发者工具',
          accelerator:
            process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(_item, focusedWindow) {
            if (focusedWindow) {
              const browserWindow = focusedWindow as BrowserWindow;
              browserWindow.webContents.toggleDevTools();
            }
          },
        },
        {
          type: 'separator',
        },
        {
          role: 'resetZoom',
          label: '实际大小',
        },
        {
          role: 'zoomIn',
          label: '放大',
        },
        {
          role: 'zoomOut',
          label: '缩小',
        },
        {
          type: 'separator',
        },
        {
          role: 'togglefullscreen',
          label: '切换全屏',
        },
      ],
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          enabled: false,
          accelerator: 'CmdOrCtrl+Z',
          click: function (_menuItem, focusedWin) {
            // Undo
            if (focusedWin) {
              void (focusedWin as BrowserWindow).webContents.executeJavaScript(
                '__actionsForMenu.undo()',
              );
            }
          },
        },
        {
          label: '重做',
          enabled: false,
          accelerator: 'Shift+CmdOrCtrl+Z',
          click: function (_menuItem, focusedWin) {
            // Redo
            if (focusedWin) {
              void (focusedWin as BrowserWindow).webContents.executeJavaScript(
                '__actionsForMenu.redo()',
              );
            }
          },
        },
        {
          type: 'separator',
        },
        {
          role: 'cut',
          label: '剪切',
        },
        {
          role: 'copy',
          label: '复制',
        },
        {
          role: 'paste',
          label: '粘贴',
        },
        {
          role: 'pasteAndMatchStyle',
          label: '粘贴并匹配样式',
        },
        {
          role: 'delete',
          label: '删除',
        },
        {
          role: 'selectAll',
          label: '全选',
        },
      ],
    },
    {
      role: 'window',
      label: '窗口',
      submenu: [
        {
          role: 'minimize',
          label: '最小化',
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    // Mac specific menu
    const name = app.getName();
    template.unshift({
      label: name,
      submenu: [
        {
          role: 'hide',
          label: '隐藏 Actual',
        },
        {
          role: 'hideOthers',
          label: '隐藏其他应用',
        },
        {
          role: 'unhide',
          label: '显示全部',
        },
        {
          type: 'separator',
        },
        {
          role: 'quit',
          label: '退出 Actual',
        },
      ],
    });

    // Window menu
    const windowIdx = template.findIndex(t => t.role === 'window');
    template[windowIdx].submenu = [
      {
        label: '关闭',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
      {
        label: '最小化',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: '缩放',
        role: 'zoom',
      },
      {
        type: 'separator',
      },
      {
        label: '全部置于前面',
        role: 'front',
      },
    ];
  }

  return Menu.buildFromTemplate(template);
}
