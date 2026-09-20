/**
 * RAGEWARE OS — Virtual In-Memory File System Service
 * 
 * Provides temporary in-session file storage for RageWare OS.
 * All saves are in-memory (not written to host machine) and persist
 * across windows for the duration of the user's session.
 */

const INITIAL_FS = {
  root: {
    name: 'C:\\',
    items: [
      { id: 'documents', name: 'My Documents', type: 'folder', size: '64 MB', date: '09/11/98' },
      { id: 'desktop', name: 'Desktop', type: 'folder', size: '18 MB', date: '09/11/98' },
      { id: 'programs', name: 'Program Files', type: 'folder', size: '480 MB', date: '09/11/98' },
      { id: 'system', name: 'System', type: 'folder', size: '124 MB', date: '09/11/98' },
      { id: 'downloads', name: 'Downloads', type: 'folder', size: '12 MB', date: '09/11/98' },
      { id: 'user', name: 'User', type: 'folder', size: '1.1 GB', date: '09/11/98' },
      { id: 'recycle_bin', name: 'Recycle Bin', type: 'folder', size: '0 KB', date: '09/11/98' },
    ],
  },
  desktop: {
    name: 'C:\\DESKTOP',
    parent: 'root',
    items: [
      { id: 'desk_notes', name: 'Desktop_Notes.txt', type: 'file', size: '2 KB', date: '09/11/98', content: 'RageWare OS Desktop Scratchpad.' },
    ],
  },
  documents: {
    name: 'C:\\USER\\DOCUMENTS',
    parent: 'root',
    items: [
      { id: 'music', name: 'Music', type: 'folder', size: '32 MB', date: '09/11/98' },
      { id: 'pictures', name: 'Pictures', type: 'folder', size: '12 MB', date: '09/11/98' },
      { id: 'videos', name: 'Videos', type: 'folder', size: '18 MB', date: '09/11/98' },
      { id: 'doc_important', name: 'Important.txt', type: 'file', size: '4 KB', date: '09/11/98', isHostile: true, content: 'MEMO:\nSubject tolerance level is diminishing.\nAdversarial desktop modulation is operating within expected parameters.' },
      { id: 'doc_project', name: 'Project.zip', type: 'file', size: '18 MB', date: '09/10/98', isHostile: true, content: 'ARCHIVE:\n[1] rageware_core.sys\n[2] frustration_matrix.dll' },
      { id: 'doc_resume', name: 'Resume.pdf', type: 'file', size: '12 KB', date: '09/08/98', isHostile: true, content: 'CURRICULUM VITAE:\nName: SUBJECT_049\nSpecialization: Human Patience Endurance\nStatus: Under Active Psychological Strain' },
      { id: 'doc_secret', name: 'Secret.dat', type: 'file', size: '64 KB', date: '09/01/98', isHostile: true, isProtected: true, content: 'CLASSIFIED ACCESS TOKEN:\n0x99_RAGE_OVERRIDE_ENABLED' },
    ],
  },
  music: {
    name: 'C:\\USER\\DOCUMENTS\\MUSIC',
    parent: 'documents',
    items: [
      { 
        id: 'music_rickroll', 
        name: 'Never_Gonna_Give_You_Up_1987.mp3', 
        type: 'audio', 
        size: '3.2 MB', 
        date: '11/12/87', 
        artist: 'Rick Astley', 
        title: 'Never Gonna Give You Up',
        album: 'Whenever You Need Somebody (1987)', 
        year: '1987', 
        genre: '80s Dance Pop',
        duration: '03:32',
        melodyId: 'rickroll',
        url: 'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3'
      },
      { 
        id: 'music_takeonme', 
        name: 'Take_On_Me_1985.mp3', 
        type: 'audio', 
        size: '3.5 MB', 
        date: '10/19/85', 
        artist: 'a-ha', 
        title: 'Take On Me',
        album: 'Hunting High and Low (1985)', 
        year: '1985', 
        genre: '80s Synthpop',
        duration: '03:45',
        melodyId: 'takeonme',
      },
      { 
        id: 'music_billiejean', 
        name: 'Billie_Jean_1982.mp3', 
        type: 'audio', 
        size: '4.5 MB', 
        date: '01/02/82', 
        artist: 'Michael Jackson', 
        title: 'Billie Jean',
        album: 'Thriller (1982)', 
        year: '1982', 
        genre: '80s Funk / Pop',
        duration: '04:54',
        melodyId: 'billiejean',
      },
      { 
        id: 'music_axelf', 
        name: 'Axel_F_Synth_Theme_1984.mid', 
        type: 'audio', 
        size: '52 KB', 
        date: '12/01/84', 
        artist: 'Harold Faltermeyer', 
        title: 'Axel F (Theme)',
        album: 'Beverly Hills Cop (1984)', 
        year: '1984', 
        genre: '80s Electronic Synth',
        duration: '03:00',
        melodyId: 'axelf',
      },
      { 
        id: 'music_smells', 
        name: 'Smells_Like_Teen_Spirit_1991.mp3', 
        type: 'audio', 
        size: '4.8 MB', 
        date: '09/24/91', 
        artist: 'Nirvana', 
        title: 'Smells Like Teen Spirit',
        album: 'Nevermind (1991)', 
        year: '1991', 
        genre: '90s Grunge Rock',
        duration: '05:01',
        melodyId: 'smells',
      },
      { 
        id: 'music_backstreet', 
        name: 'I_Want_It_That_Way_1999.mp3', 
        type: 'audio', 
        size: '3.3 MB', 
        date: '04/12/99', 
        artist: 'Backstreet Boys', 
        title: 'I Want It That Way',
        album: 'Millennium (1999)', 
        year: '1999', 
        genre: '90s Boyband Pop',
        duration: '03:33',
        melodyId: 'backstreet',
      },
      { 
        id: 'music_sandstorm', 
        name: 'Sandstorm_Club_Mix_1999.mp3', 
        type: 'audio', 
        size: '3.6 MB', 
        date: '11/15/99', 
        artist: 'Darude', 
        title: 'Sandstorm',
        album: 'Before the Storm (1999)', 
        year: '1999', 
        genre: '90s Eurodance Trance',
        duration: '03:44',
        melodyId: 'sandstorm',
      },
      { 
        id: 'music_britney', 
        name: 'Baby_One_More_Time_1998.mp3', 
        type: 'audio', 
        size: '3.4 MB', 
        date: '10/23/98', 
        artist: 'Britney Spears', 
        title: '...Baby One More Time',
        album: '...Baby One More Time (1998)', 
        year: '1998', 
        genre: '90s Teen Pop',
        duration: '03:30',
        melodyId: 'britney',
      },
    ],
  },
  pictures: {
    name: 'C:\\USER\\DOCUMENTS\\PICTURES',
    parent: 'documents',
    items: [
      {
        id: 'pic_battlestation',
        name: 'Retro_PC_Battlestation_1995.jpg',
        type: 'image',
        size: '1.8 MB',
        date: '09/02/98',
        url: '/assets/images/vintage_ibm_pc_1990s.jpg',
        caption: 'Authentic Vintage PC with Green CRT Monitor, DOS Prompt & Mechanical Keyboard',
        dimensions: '1024 x 768',
      },
      {
        id: 'pic_floppy',
        name: 'Floppy_Disk_Collection.jpg',
        type: 'image',
        size: '1.5 MB',
        date: '07/20/98',
        url: '/assets/images/floppy_disk_35_inch.jpg',
        caption: 'Classic Magnetic Floppy Diskettes (8-inch, 5.25-inch, and 3.5-inch HD)',
        dimensions: '1200 x 800',
      },
      {
        id: 'pic_gameboy',
        name: 'Nintendo_Game_Boy_1989.jpg',
        type: 'image',
        size: '1.1 MB',
        date: '04/21/89',
        url: '/assets/images/nintendo_gameboy_1989.jpg',
        caption: 'Original 1989 Nintendo Game Boy Handheld Console (Dot Matrix Display)',
        dimensions: '800 x 1200',
      },
      {
        id: 'pic_playstation',
        name: 'Sony_PlayStation_1995.png',
        type: 'image',
        size: '6.4 MB',
        date: '12/03/94',
        url: '/assets/images/sony_playstation_1995.png',
        caption: 'Classic 1995 Sony PlayStation 1 (PS1) 32-Bit CD Console',
        dimensions: '1200 x 800',
      },
    ],
  },
  videos: {
    name: 'C:\\USER\\DOCUMENTS\\VIDEOS',
    parent: 'documents',
    items: [
      {
        id: 'vid_rickroll',
        name: 'Rick_Astley_Never_Gonna_Give_You_Up.mp4',
        type: 'video',
        size: '21.1 MB',
        date: '11/12/87',
        url: 'https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
        caption: 'Rick Astley - Never Gonna Give You Up (1987 / ActiveMovie 98)',
        resolution: '640 x 480 MPEG-4',
        isRickRoll: true,
      },
      {
        id: 'vid_secret_rickroll',
        name: 'CLASSIFIED_OS_EXPLOIT_DO_NOT_OPEN.mp4',
        type: 'video',
        size: '21.1 MB',
        date: '09/12/98',
        url: 'https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1',
        caption: 'WARNING: Cognitive Adversary Triggered! (Official AltF4 Rickroll)',
        resolution: '640 x 480 MPEG-4',
        isRickRoll: true,
      },
      {
        id: 'vid_nature',
        name: 'Nature_Documentary_Clip.mp4',
        type: 'video',
        size: '1.1 MB',
        date: '09/01/98',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
        caption: 'ActiveMovie Botanical Movement Sequence',
        resolution: '320 x 240 Cinepak',
      },
      {
        id: 'vid_motion',
        name: 'Classic_Motion_Video_1998.mp4',
        type: 'video',
        size: '512 KB',
        date: '08/28/98',
        url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4',
        caption: '1998 Digital Video Stream Test',
        resolution: '320 x 240 Cinepak',
      },
    ],
  },
  programs: {
    name: 'C:\\PROGRAM FILES',
    parent: 'root',
    items: [
      { id: 'prog_mon', name: 'Sysmon.exe', type: 'file', size: '14 MB', date: '09/09/98', content: 'SYSTEM MONITOR PROGRAM\nDiagnostic tool.' },
      { id: 'prog_term', name: 'Command.exe', type: 'file', size: '8 MB', date: '09/07/98', content: 'COMMAND PROMPT INTERPRETER' },
    ],
  },
  system: {
    name: 'C:\\SYSTEM',
    parent: 'root',
    items: [
      { id: 'sys_cfg', name: 'rageware.sys', type: 'file', size: '3.4 MB', date: '09/11/98', content: 'KERNEL CONFIGURATION' },
      { id: 'drivers', name: 'drivers.bin', type: 'file', size: '48 MB', date: '09/10/98', content: 'HARDWARE DRIVERS' },
    ],
  },
  downloads: {
    name: 'C:\\DOWNLOADS',
    parent: 'root',
    items: [
      { id: 'dl_patch', name: 'Patch99.tmp', type: 'file', size: '99 MB', date: '09/11/98', content: 'CORRUPTED BUFFER AT 99%.' },
      { id: 'dl_manual', name: 'Patience.txt', type: 'file', size: '1.2 MB', date: '09/05/98', content: 'HOW TO PROPERLY TOLERATE EVASIVE INTERFACES.' },
    ],
  },
  user: {
    name: 'C:\\USER',
    parent: 'root',
    items: [
      { id: 'documents', name: 'Documents', type: 'folder', size: '64 MB', date: '09/11/98' },
      { id: 'desktop', name: 'Desktop', type: 'folder', size: '18 MB', date: '09/11/98' },
    ],
  },
  recycle_bin: {
    name: 'C:\\RECYCLE BIN',
    parent: 'root',
    items: [],
  },
};

class VirtualFileSystem {
  constructor() {
    this.fs = JSON.parse(JSON.stringify(INITIAL_FS));
    this.listeners = new Set();
  }

  getFileSystem() {
    return this.fs;
  }

  getFolder(folderId) {
    return this.fs[folderId] || this.fs.root;
  }

  getFolderList() {
    return [
      { id: 'pictures', name: 'Pictures', path: 'C:\\USER\\DOCUMENTS\\PICTURES' },
      { id: 'documents', name: 'My Documents', path: 'C:\\USER\\DOCUMENTS' },
      { id: 'desktop', name: 'Desktop', path: 'C:\\DESKTOP' },
      { id: 'downloads', name: 'Downloads', path: 'C:\\DOWNLOADS' },
      { id: 'recycle_bin', name: 'Recycle Bin', path: 'C:\\RECYCLE BIN' },
      { id: 'root', name: 'C:\\ (Root Drive)', path: 'C:\\' },
    ];
  }

  addFile(folderId, fileItem) {
    const targetFolder = this.fs[folderId] || this.fs.pictures;
    // Prepend so newest files appear first
    targetFolder.items = [fileItem, ...targetFolder.items.filter(it => it.id !== fileItem.id)];
    this.notify();
    return fileItem;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.fs);
      } catch (err) {
        console.error('virtualFs listener error:', err);
      }
    }
  }
}

export const virtualFs = new VirtualFileSystem();
