const openAdminLogin=()=>{
 const button=document.getElementById('admin-edit');
 if(button&&button.getAttribute('aria-pressed')!=='true')button.click();
};

window.addEventListener('DOMContentLoaded',()=>{
 const intro=document.getElementById('admin-intro-login');
 if(intro)intro.addEventListener('click',openAdminLogin);
 if(location.pathname.endsWith('/admin-photos.html'))setTimeout(openAdminLogin,600);
});
