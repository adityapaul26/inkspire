let words=['INKSPIRE','Insights','Stories','Ideas','Trends','Perspectives']

function delay1(){
    return new Promise((resolve, reject) => {
        setInterval(() => {
            resolve(1)
        }, 100);
    })
}

function delay2(){
    return new Promise((resolve, reject) => {
        setInterval(() => {
            resolve(1)
        }, 200);
    })  
}

async function main(){
    let item = document.querySelector(".logo");
    while(true){
        for(const i of words){
            //console.log(i);
            if(i==='INKSPIRE') {
                item.style.color = "#d99100";
                // item.style.border = "4.8px solid #d99100";
                document.getElementById("header").style.border = "4.8px solid #d99100";
            }else{
                item.style.color = "#e5be89";
                // item.style.border = "4.8px solid #d99100";
                document.getElementById("header").style.border = "4.8px solid #e5be89";
            }
            
            // if(i==='INKSPIRE') item.classList.add("gold");
            // if(i==='Insights') item.classList.remove("gold");
            for(const j of i){
                // console.log(j)
                item.innerHTML=  item.innerHTML + j
                await delay1()
            }
            await delay2();
            let del=item.innerHTML
    
            while(del.length > 0){
                del = del.slice(0,-1)
                item.innerHTML=del
                await delay1()
            }
            await delay2();
        }
    }
}
main()
document.getElementById("scrollBtn").addEventListener("click", function() {
    window.scrollTo({
      top: 800,      // vertical position in px
      left: 0,
      behavior: "smooth" // smooth scrolling
    });
  });







