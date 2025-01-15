import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import { Maximize2, Minimize2, X, Terminal as TerminalIcon } from 'lucide-react';
import 'xterm/css/xterm.css';

// Matrix effect function
const startMatrixEffect = (term) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
  const width = Math.floor(term.cols / 2);
  const streams = Array(width).fill(0);
  
  const interval = setInterval(() => {
    let output = '';
    streams.forEach((_, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      output += (i === 0 ? '' : ' ') + '\x1b[32m' + char + '\x1b[0m';
    });
    term.writeln(output);
  }, 100);

  // Stop after 5 seconds
  setTimeout(() => {
    clearInterval(interval);
    term.write('\x1b[1;36m➜\x1b[0m ');
  }, 5000);
};

const Terminal = () => {
  const terminalRef = useRef(null);
  const xtermRef = useRef(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [title] = useState('Terminal');

  useEffect(() => {
    if (xtermRef.current) {
      const fitAddon = new FitAddon();
      xtermRef.current.loadAddon(fitAddon);
      setTimeout(() => fitAddon.fit(), 0);
    }
  }, [isMaximized]);

  useEffect(() => {
    const term = new XTerm({
      allowProposedApi: true,
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 14,
      fontFamily: '"Cascadia Code", Menlo, "DejaVu Sans Mono", Consolas, "Lucida Console", monospace',
      letterSpacing: 0,
      lineHeight: 1.2,
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#528bff',
        selection: '#28324a',
        black: '#32344a',
        brightBlack: '#444b6a',
        red: '#f7768e',
        brightRed: '#ff7a93',
        green: '#9ece6a',
        brightGreen: '#b9f27c',
        yellow: '#e0af68',
        brightYellow: '#ff9e64',
        blue: '#7aa2f7',
        brightBlue: '#7da6ff',
        magenta: '#ad8ee6',
        brightMagenta: '#bb9af7',
        cyan: '#449dab',
        brightCyan: '#0db9d7',
        white: '#787c99',
        brightWhite: '#acb0d0'
      }
    });

    const fitAddon = new FitAddon();
    const searchAddon = new SearchAddon();
    
    term.loadAddon(fitAddon);
    term.loadAddon(searchAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(terminalRef.current);
    fitAddon.fit();
    xtermRef.current = term;

    term.writeln('\x1b[1;34m╭────────────────────────────────────────────╮\x1b[0m');
    term.writeln('\x1b[1;34m│\x1b[0m  \x1b[1;32mWelcome to Enhanced Terminal\x1b[0m          \x1b[1;34m│\x1b[0m');
    term.writeln('\x1b[1;34m│\x1b[0m  \x1b[1;36mBy Dante Collazzi\x1b[0m                     \x1b[1;34m│\x1b[0m');
    term.writeln('\x1b[1;34m╰────────────────────────────────────────────╯\x1b[0m');
    term.writeln('');
    term.writeln('\x1b[1;33mAvailable commands:\x1b[0m');
    term.writeln('  \x1b[1;32mhelp\x1b[0m      - Show this help message');
    term.writeln('  \x1b[1;32mclear\x1b[0m     - Clear the terminal screen');
    term.writeln('  \x1b[1;32mdate\x1b[0m      - Display current date and time');
    term.writeln('  \x1b[1;32msystem\x1b[0m    - Display system information');
    term.writeln('  \x1b[1;32mmatrix\x1b[0m    - Display Matrix effect');
    term.writeln('  \x1b[1;32mcolor\x1b[0m     - Show terminal colors');
    term.writeln('  \x1b[1;32mbanner\x1b[0m    - Display ASCII art banner');
    term.writeln('');
    term.write('\x1b[1;36m➜\x1b[0m ');

    let currentLine = '';
    let history = [];
    let historyIndex = -1;

    term.onKey(({ key, domEvent }) => {
      const char = key;
      
      switch (domEvent.keyCode) {
        case 13: // Enter
          term.write('\r\n');
          if (currentLine.trim()) {
            history.push(currentLine);
            historyIndex = history.length;
            processCommand(currentLine.trim(), term);
          }
          currentLine = '';
          term.write('\x1b[1;36m➜\x1b[0m ');
          break;
          
        case 38: // Up arrow
          if (historyIndex > 0) {
            historyIndex--;
            term.write('\r\x1b[K\x1b[1;36m➜\x1b[0m ' + history[historyIndex]);
            currentLine = history[historyIndex];
          }
          break;
          
        case 40: // Down arrow
          if (historyIndex < history.length - 1) {
            historyIndex++;
            term.write('\r\x1b[K\x1b[1;36m➜\x1b[0m ' + history[historyIndex]);
            currentLine = history[historyIndex];
          } else {
            historyIndex = history.length;
            term.write('\r\x1b[K\x1b[1;36m➜\x1b[0m ');
            currentLine = '';
          }
          break;
          
        case 8: // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            term.write('\b \b');
          }
          break;
          
        default:
          if (char.length === 1) {
            currentLine += char;
            term.write(char);
          }
      }
    });

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (xtermRef.current) {
        xtermRef.current.dispose();
      }
    };
  }, []);

  const processCommand = (input, term) => {
    const cmd = input.toLowerCase();
    
    switch (cmd) {
      case 'help':
        term.writeln('\x1b[1;33mAvailable commands:\x1b[0m');
        term.writeln('  \x1b[1;32mhelp\x1b[0m      - Show this help message');
        term.writeln('  \x1b[1;32mclear\x1b[0m     - Clear the terminal screen');
        term.writeln('  \x1b[1;32mdate\x1b[0m      - Display current date and time');
        term.writeln('  \x1b[1;32msystem\x1b[0m    - Display system information');
        term.writeln('  \x1b[1;32mmatrix\x1b[0m    - Display Matrix effect');
        term.writeln('  \x1b[1;32mcolor\x1b[0m     - Show terminal colors');
        term.writeln('  \x1b[1;32mbanner\x1b[0m    - Display ASCII art banner');
        break;
        
      case 'clear':
        term.clear();
        break;
        
      case 'date':
        term.writeln('\x1b[1;34m' + new Date().toLocaleString() + '\x1b[0m');
        break;
        
      case 'system':
        term.writeln('\x1b[1;35mSystem Information:\x1b[0m');
        term.writeln('  \x1b[33m→\x1b[0m OS: ' + navigator.platform);
        term.writeln('  \x1b[33m→\x1b[0m Browser: ' + navigator.userAgent.split(' ').pop());
        term.writeln('  \x1b[33m→\x1b[0m Resolution: ' + window.innerWidth + 'x' + window.innerHeight);
        break;
        
      case 'matrix':
        startMatrixEffect(term);
        break;

      case 'color':
        term.writeln('\x1b[1;31mRed\x1b[0m');
        term.writeln('\x1b[1;32mGreen\x1b[0m');
        term.writeln('\x1b[1;33mYellow\x1b[0m');
        term.writeln('\x1b[1;34mBlue\x1b[0m');
        term.writeln('\x1b[1;35mMagenta\x1b[0m');
        term.writeln('\x1b[1;36mCyan\x1b[0m');
        break;

      case 'banner':
        term.writeln('\x1b[1;35m');
        term.writeln('   ____              _       ');
        term.writeln('  |  _ \\  __ _ _ __ | |_ ___ ');
        term.writeln('  | | | |/ _` | \'_ \\| __/ _ \\');
        term.writeln('  | |_| | (_| | | | | ||  __/');
        term.writeln('  |____/ \\__,_|_| |_|\\__\\___|');
        term.writeln('\x1b[0m');
        break;

      default:
        if (cmd.startsWith('echo ')) {
          term.writeln(cmd.slice(5));
        } else {
          term.writeln('\x1b[1;31mCommand not found:\x1b[0m ' + cmd);
        }
    }
  };

  return (
    <div className={`${isMaximized ? 'fixed inset-0 z-50 p-4 bg-gray-900/90' : 'w-full h-96'} transition-all duration-300`}>
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <TerminalIcon size={16} className="text-green-500" />
            <span className="text-sm font-medium text-gray-200">{title}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              {isMaximized ? 
                <Minimize2 size={14} className="text-gray-400 hover:text-gray-200" /> :
                <Maximize2 size={14} className="text-gray-400 hover:text-gray-200" />
              }
            </button>
            <button
              onClick={() => xtermRef.current?.clear()}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <X size={14} className="text-gray-400 hover:text-gray-200" />
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          <div 
            ref={terminalRef}
            className="absolute inset-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;