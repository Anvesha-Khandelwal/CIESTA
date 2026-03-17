const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Text Replacements
html = html.replace(/CISETA/g, 'CIESTA');
html = html.replace(/ciseta@dsce.edu.in/g, 'ciesta@dsce.edu.in');
html = html.replace(/'25/g, '4.0');
html = html.replace(/2025/g, '2026');
html = html.replace(/April 18–19/g, 'April 9–11');
html = html.replace(/Apr 18/g, 'Apr 9');
html = html.replace(/Apr 19/g, 'Apr 10'); // for day 2 events, day 3 is Apr 11
html = html.replace(/April 18, 2026/g, 'April 9, 2026');
html = html.replace(/April 19, 2026/g, 'April 10, 2026'); // wait, the string was 2025 initially
html = html.replace(/April 10, 2026/g, 'April 9, 2026'); // fix registration deadline string

// Let's refine the date replacements carefully as we already replaced 2025 with 2026.

// 2. Add Photo Dump section
const aboutSectionEnd = `  </div>\n</section>\n\n<hr class="hdivider">`;

const photoDumpHTML = `

<!-- PHOTO DUMP -->
<section id="photodump">
  <p class="stag">Memories</p>
  <h2 class="stitle">Photo Dump from Last Event</h2>
  <p class="sbody" style="margin-bottom: 2rem">A glimpse into the energy and excitement of CIESTA's previous edition.</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem;">
    <div style="background:#e5e7eb;border-radius:12px;overflow:hidden;aspect-ratio:4/3;"><img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80" alt="Audience" style="width:100%;height:100%;object-fit:cover;"></div>
    <div style="background:#e5e7eb;border-radius:12px;overflow:hidden;aspect-ratio:4/3;"><img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80" alt="Hackathon" style="width:100%;height:100%;object-fit:cover;"></div>
    <div style="background:#e5e7eb;border-radius:12px;overflow:hidden;aspect-ratio:4/3;"><img src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80" alt="Tech Setup" style="width:100%;height:100%;object-fit:cover;"></div>
    <div style="background:#e5e7eb;border-radius:12px;overflow:hidden;aspect-ratio:4/3;"><img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&q=80" alt="Team" style="width:100%;height:100%;object-fit:cover;"></div>
  </div>
</section>

<hr class="hdivider">`;

html = html.replace('<!-- EVENTS -->', photoDumpHTML + '\n\n<!-- EVENTS -->');

// 3. Meet the Team (Akira) replacement
// The current FACULTY section
const facultyOld = `<!-- FACULTY -->
<section id="faculty">
  <p class="stag">The Team Behind It</p>
  <h2 class="stitle">Faculty Coordinators</h2>
  <p class="sbody">CIESTA 2026 is organized under the guidance of our distinguished faculty from the Department of Computer Science &amp; Engineering.</p>
  <div class="fac-grid" id="fac-grid"></div>
</section>`;

const teamNew = `<!-- TEAM -->
<section id="faculty">
  <p class="stag">The Team Behind It</p>
  <h2 class="stitle">Meet the Team (Akira)</h2>
  <p class="sbody">CIESTA 4.0 is organized and brought to life by Akira, the official CSE cultural team.</p>
  <div class="fac-grid" id="fac-grid"></div>
</section>`;

html = html.replace(facultyOld, teamNew);

// Replace FACULTY array in JS
const facultyJSOld = `const FACULTY=[
  {name:"Dr. S. Meenakshi",role:"Faculty Convenor",dept:"Professor & HOD, CS&E",init:"SM",bg:"#dbeafe",tc:"#1e40af"},
  {name:"Prof. R. Krishnamurthy",role:"Event Co-ordinator",dept:"Associate Professor, CS&E",init:"RK",bg:"#dcfce7",tc:"#15803d"},
  {name:"Dr. Anitha Patil",role:"Technical Lead",dept:"Assistant Professor, CS&E",init:"AP",bg:"#fce7f3",tc:"#9d174d"},
  {name:"Prof. Vinod Kumar",role:"Registration Head",dept:"Assistant Professor, CS&E",init:"VK",bg:"#e0e7ff",tc:"#3730a3"},
  {name:"Dr. Kavitha Rao",role:"Research Track",dept:"Associate Professor, CS&E",init:"KR",bg:"#d1fae5",tc:"#065f46"},
  {name:"Prof. Sanjay Nair",role:"Sponsorship Lead",dept:"Assistant Professor, CS&E",init:"SN",bg:"#fef3c7",tc:"#92400e"}
];`;

const teamJSNew = `const FACULTY=[
  {name:"Arjun Reddy",role:"President",dept:"Akira Cultural Team",init:"AR",bg:"#dbeafe",tc:"#1e40af"},
  {name:"Priya Sharma",role:"Vice President",dept:"Akira Cultural Team",init:"PS",bg:"#dcfce7",tc:"#15803d"},
  {name:"Rohan Nair",role:"Event Head",dept:"Akira Cultural Team",init:"RN",bg:"#fce7f3",tc:"#9d174d"},
  {name:"Sneha Patil",role:"Technical Head",dept:"Akira Cultural Team",init:"SP",bg:"#e0e7ff",tc:"#3730a3"},
  {name:"Vikram Singh",role:"Design Lead",dept:"Akira Cultural Team",init:"VS",bg:"#d1fae5",tc:"#065f46"},
  {name:"Ananya Desai",role:"Logistics Head",dept:"Akira Cultural Team",init:"AD",bg:"#fef3c7",tc:"#92400e"}
];`;

html = html.replace(facultyJSOld, teamJSNew);

// Rewrite handleReg to use fetch
const regOld = `function handleReg(){
  var fname=document.getElementById("f-fname").value.trim();
  var lname=document.getElementById("f-lname").value.trim();
  var usn=document.getElementById("f-usn").value.trim();
  var college=document.getElementById("f-college").value.trim();
  var email=document.getElementById("f-email").value.trim();
  var phone=document.getElementById("f-phone").value.trim();
  var year=document.getElementById("f-year").value;
  var event=document.getElementById("f-event").value;
  var team=document.getElementById("f-team").value.trim();
  document.getElementById("ferr").style.display="none";
  document.getElementById("fok").style.display="none";
  if(!fname||!lname||!usn||!college||!email||!phone||!year||!event){
    document.getElementById("ferr").style.display="block";return;
  }
  var now=new Date();
  var t=now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  participants.push({name:fname+" "+lname,usn:usn,college:college,email:email,phone:phone,year:year,event:event,team:team||"—",time:t});
  renderTbl("");
  var btn=document.getElementById("sbtn");
  btn.textContent="✓ Registered!";btn.disabled=true;
  document.getElementById("fok").style.display="block";
  ["f-fname","f-lname","f-usn","f-college","f-email","f-phone","f-team"].forEach(function(id){document.getElementById(id).value="";});
  document.getElementById("f-year").value="";document.getElementById("f-event").value="";
  setTimeout(function(){btn.textContent="Submit Registration";btn.disabled=false;},3000);
  setTimeout(function(){document.getElementById("participants").scrollIntoView({behavior:"smooth"});},800);
}`;

const regNew = `async function handleReg(){
  var fname=document.getElementById("f-fname").value.trim();
  var lname=document.getElementById("f-lname").value.trim();
  var usn=document.getElementById("f-usn").value.trim();
  var college=document.getElementById("f-college").value.trim();
  var email=document.getElementById("f-email").value.trim();
  var phone=document.getElementById("f-phone").value.trim();
  var year=document.getElementById("f-year").value;
  var event=document.getElementById("f-event").value;
  var team=document.getElementById("f-team").value.trim();
  document.getElementById("ferr").style.display="none";
  document.getElementById("fok").style.display="none";
  if(!fname||!lname||!usn||!college||!email||!phone||!year||!event){
    document.getElementById("ferr").style.display="block";return;
  }
  
  var now=new Date();
  var t=now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
  var payload = {name:fname+" "+lname,usn:usn,college:college,email:email,phone:phone,year:year,event:event,team:team||"—",time:t};
  
  var btn=document.getElementById("sbtn");
  btn.textContent="Submitting...";btn.disabled=true;
  
  try {
      let res = await fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Registration failed');
      
      // refresh participants
      await fetchParticipants();
      
      btn.textContent="✓ Registered!";
      document.getElementById("fok").style.display="block";
      ["f-fname","f-lname","f-usn","f-college","f-email","f-phone","f-team"].forEach(function(id){document.getElementById(id).value="";});
      document.getElementById("f-year").value="";document.getElementById("f-event").value="";
      setTimeout(function(){btn.textContent="Submit Registration";btn.disabled=false;},3000);
      setTimeout(function(){document.getElementById("participants").scrollIntoView({behavior:"smooth"});},800);
  } catch (err) {
      document.getElementById("ferr").textContent = "Registration error: " + err.message;
      document.getElementById("ferr").style.display="block";
      btn.textContent="Submit Registration";btn.disabled=false;
  }
}`;

html = html.replace(regOld, regNew);

// Add fetchParticipants function call
const renderTblAppend = `
async function fetchParticipants() {
    try {
        let res = await fetch('http://localhost:3000/api/participants');
        let data = await res.json();
        participants = data;
        renderTbl("");
    } catch(err) {
        console.error("Error fetching participants:", err);
    }
}
fetchParticipants(); // call on load
`;

html = html.replace('function filterTbl(){renderTbl(document.getElementById("tsearch").value.toLowerCase());}', 'function filterTbl(){renderTbl(document.getElementById("tsearch").value.toLowerCase());}\n' + renderTblAppend);


fs.writeFileSync(filePath, html, 'utf8');
console.log('Update complete.');
