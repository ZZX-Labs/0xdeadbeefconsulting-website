'use strict';

const INCLUDES={
    header:'/partials/header.html',
    nav:'/partials/nav.html',
    footer:'/partials/footer.html'
};

const MOBILE_NAV_QUERY='(max-width:900px)';

document.addEventListener('DOMContentLoaded',async()=>{
    await loadIncludes();

    initializeNavigation();
    initializeActiveLinks();
    initializeHeaderScroll();
    initializeSmoothScroll();
    initializeCopyButtons();
    initializeCurrentYear();
});

async function loadIncludes(root=document){
    while(true){
        const elements=[...root.querySelectorAll('[data-include]')];

        if(!elements.length) return;

        await Promise.all(elements.map(loadInclude));
    }
}

async function loadInclude(element){
    const name=element.getAttribute('data-include');
    const includeURL=INCLUDES[name];

    /*
     * Remove the loading attribute before fetching. This prevents a failed
     * component from being processed repeatedly by loadIncludes().
     */
    element.removeAttribute('data-include');

    if(!name||!includeURL){
        console.error(`Unknown include component: ${name||'(empty)'}`);
        element.setAttribute('include-error',name||'unknown');
        return;
    }

    try{
        const response=await fetch(includeURL,{
            method:'GET',
            cache:'no-store',
            credentials:'same-origin',
            headers:{
                Accept:'text/html'
            }
        });

        if(!response.ok){
            throw new Error(
                `${response.status} ${response.statusText}: ${includeURL}`
            );
        }

        element.innerHTML=await response.text();
        element.setAttribute('include-loaded',name);
    }catch(error){
        console.error(`Unable to load include "${name}":`,error);
        element.setAttribute('include-error',name);
    }
}

function initializeNavigation(){
    const menuToggle=document.querySelector('.menu-toggle');
    const navLinks=document.querySelector('.nav-links');

    if(!menuToggle||!navLinks) return;

    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label','Open navigation menu');

    menuToggle.addEventListener('click',()=>{
        const open=!navLinks.classList.contains('open');

        setNavigationState(menuToggle,navLinks,open);
    });

    document.querySelectorAll('.dropdown-toggle').forEach(toggle=>{
        toggle.setAttribute('aria-expanded','false');

        toggle.addEventListener('click',event=>{
            const parent=toggle.closest('.submenu');

            if(!parent) return;

            /*
             * On desktop, the top-level link remains navigable. CSS may display
             * the dropdown through hover or focus. On mobile, clicking toggles
             * the submenu instead of navigating immediately.
             */
            if(!window.matchMedia(MOBILE_NAV_QUERY).matches) return;

            event.preventDefault();

            const open=!parent.classList.contains('open');

            closeDropdowns(parent);
            setDropdownState(parent,toggle,open);
        });
    });

    document.addEventListener('click',event=>{
        const insideNavigation=navLinks.contains(event.target);
        const insideToggle=menuToggle.contains(event.target);

        if(!insideNavigation&&!insideToggle){
            setNavigationState(menuToggle,navLinks,false);
            closeDropdowns();
        }
    });

    document.addEventListener('keydown',event=>{
        if(event.key!=='Escape') return;

        const navigationWasOpen=navLinks.classList.contains('open');
        const dropdownWasOpen=Boolean(
            document.querySelector('.nav-links .submenu.open')
        );

        setNavigationState(menuToggle,navLinks,false);
        closeDropdowns();

        if(navigationWasOpen||dropdownWasOpen){
            menuToggle.focus();
        }
    });

    window.addEventListener('resize',()=>{
        if(window.matchMedia('(min-width:901px)').matches){
            setNavigationState(menuToggle,navLinks,false);
            closeDropdowns();
        }
    });
}

function setNavigationState(menuToggle,navLinks,open){
    navLinks.classList.toggle('open',open);
    menuToggle.setAttribute('aria-expanded',String(open));
    menuToggle.setAttribute(
        'aria-label',
        open?'Close navigation menu':'Open navigation menu'
    );
    document.body.classList.toggle('menu-open',open);
}

function setDropdownState(parent,toggle,open){
    parent.classList.toggle('open',open);
    toggle.setAttribute('aria-expanded',String(open));
}

function closeDropdowns(exception=null){
    document.querySelectorAll('.nav-links .submenu.open').forEach(item=>{
        if(item===exception) return;

        item.classList.remove('open');

        const toggle=item.querySelector(':scope > .dropdown-toggle');

        if(toggle){
            toggle.setAttribute('aria-expanded','false');
        }
    });
}

function initializeActiveLinks(){
    const currentPath=normalizePath(window.location.pathname);

    document.querySelectorAll('.nav-links a[href]').forEach(link=>{
        const href=link.getAttribute('href');

        if(
            !href||
            href.startsWith('#')||
            href.startsWith('mailto:')||
            href.startsWith('tel:')||
            href.startsWith('javascript:')
        ){
            return;
        }

        let url;

        try{
            url=new URL(href,window.location.origin);
        }catch{
            return;
        }

        if(url.origin!==window.location.origin) return;

        const linkPath=normalizePath(url.pathname);
        const exactMatch=linkPath===currentPath;
        const sectionMatch=
            linkPath!=='/'&&
            currentPath.startsWith(linkPath);

        if(!exactMatch&&!sectionMatch) return;

        link.classList.add('active');

        if(exactMatch){
            link.setAttribute('aria-current','page');
        }

        const submenu=link.closest('.submenu');

        if(!submenu) return;

        const parentLink=submenu.querySelector(':scope > .dropdown-toggle');

        if(parentLink){
            parentLink.classList.add('active');
        }
    });
}

function initializeHeaderScroll(){
    const header=document.querySelector('.header, .site-header, header');

    if(!header) return;

    const updateHeader=()=>{
        header.classList.toggle('scrolled',window.scrollY>20);
    };

    updateHeader();

    window.addEventListener('scroll',updateHeader,{
        passive:true
    });
}

function initializeSmoothScroll(){
    document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
        anchor.addEventListener('click',event=>{
            const href=anchor.getAttribute('href');

            if(!href||href==='#') return;

            let target;

            try{
                target=document.querySelector(href);
            }catch{
                return;
            }

            if(!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior:'smooth',
                block:'start'
            });

            if(history.pushState){
                history.pushState(null,'',href);
            }else{
                window.location.hash=href;
            }
        });
    });
}

function initializeCopyButtons(){
    document.querySelectorAll('[data-copy]').forEach(button=>{
        button.addEventListener('click',async()=>{
            const selector=button.dataset.copy;

            if(!selector) return;

            let source;

            try{
                source=document.querySelector(selector);
            }catch{
                return;
            }

            if(!source) return;

            const value=(
                source.value||
                source.textContent||
                ''
            ).trim();

            if(!value) return;

            const originalText=button.textContent;

            try{
                await copyText(value);

                button.textContent='Copied';
                button.classList.add('copied');

                window.setTimeout(()=>{
                    button.textContent=originalText;
                    button.classList.remove('copied');
                },1500);
            }catch(error){
                console.error('Unable to copy value:',error);

                button.textContent='Copy failed';

                window.setTimeout(()=>{
                    button.textContent=originalText;
                },1500);
            }
        });
    });
}

async function copyText(value){
    if(
        navigator.clipboard&&
        window.isSecureContext
    ){
        await navigator.clipboard.writeText(value);
        return;
    }

    const textarea=document.createElement('textarea');

    textarea.value=value;
    textarea.setAttribute('readonly','');
    textarea.style.position='fixed';
    textarea.style.opacity='0';
    textarea.style.pointerEvents='none';

    document.body.append(textarea);
    textarea.select();

    const copied=document.execCommand('copy');

    textarea.remove();

    if(!copied){
        throw new Error('Clipboard operation failed.');
    }
}

function initializeCurrentYear(){
    const year=String(new Date().getFullYear());

    document.querySelectorAll('.current-year').forEach(element=>{
        element.textContent=year;
    });
}

function normalizePath(path){
    if(!path) return '/';

    let normalized=path
        .replace(/\/index\.html$/i,'/')
        .replace(/\/+/g,'/');

    if(!normalized.startsWith('/')){
        normalized=`/${normalized}`;
    }

    if(normalized.length>1&&!normalized.endsWith('/')){
        normalized=`${normalized}/`;
    }

    return normalized;
}
