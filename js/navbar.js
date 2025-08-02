// Modern Navigation JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Navbar script loaded');
  
  const hamburgerMenu = document.getElementById('hamburgerMenu');
  const mobileNavMenu = document.getElementById('mobileNavMenu');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const closeMenu = document.getElementById('closeMenu');
  
  console.log('Elements found:', {
    hamburgerMenu: !!hamburgerMenu,
    mobileNavMenu: !!mobileNavMenu,
    mobileOverlay: !!mobileOverlay,
    closeMenu: !!closeMenu
  });

  function toggleMenu() {
    console.log('Toggle menu called');
    const isActive = mobileNavMenu.classList.contains('active');
    
    if (isActive) {
      // Close menu
      hamburgerMenu.classList.remove('active');
      mobileNavMenu.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
      console.log('Menu closed');
    } else {
      // Open menu
      hamburgerMenu.classList.add('active');
      mobileNavMenu.classList.add('active');
      mobileOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      console.log('Menu opened');
    }
  }
  
  if (hamburgerMenu && closeMenu) {
    console.log('Adding event listeners');
    hamburgerMenu.addEventListener('click', function(e) {
      console.log('Hamburger clicked!', e);
      toggleMenu();
    });
    closeMenu.addEventListener('click', function(e) {
      console.log('Close button clicked!', e);
      toggleMenu();
    });
  } else {
    console.log('Missing elements:', { 
      hamburgerMenu: !!hamburgerMenu, 
      closeMenu: !!closeMenu 
    });
  }

  // Close menu when clicking on overlay
  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', toggleMenu);
  }

  // Close menu when clicking on a nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      hamburgerMenu.classList.remove('active');
      mobileNavMenu.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      hamburgerMenu.classList.remove('active');
      mobileNavMenu.classList.remove('active');
      mobileOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
});

// Authentication functions
function checkAuth() {
  const token = localStorage.getItem('userToken');
  const userName = localStorage.getItem('userName');
  
  if (token && userName) {
    const welcomeUser = document.getElementById('welcomeUser');
    const logout = document.getElementById('logout');
    const loginNav = document.getElementById('login-nav');
    
    if (welcomeUser) welcomeUser.textContent = `Welcome ${userName}`;
    if (logout) logout.style.display = 'block';
    if (loginNav) loginNav.style.display = 'none';
  } else {
    const welcomeUser = document.getElementById('welcomeUser');
    const logout = document.getElementById('logout');
    const loginNav = document.getElementById('login-nav');
    
    if (welcomeUser) welcomeUser.textContent = 'Welcome Guest';
    if (logout) logout.style.display = 'none';
    if (loginNav) loginNav.style.display = 'block';
  }
}

function logout() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  window.location.href = 'login.html';
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', checkAuth);
