let input = document.querySelector("#search");

let productContainer = document.querySelector(".product-container");

let setId;
input.addEventListener("keyup", function () {
  clearTimeout(setId);
  setId = setTimeout(() => {
    fetch("./stocks.json")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data[0]);
        let searchTerm = input.value.toLowerCase();
        let filteredStocks = data.filter((stock) => {
          return (
            stock["Issuer Name"].toLowerCase().includes(searchTerm) ||
            stock["Security Id"].toLowerCase().includes(searchTerm)
          );
        });
        display(filteredStocks);
      })
      .catch((err) => {
        console.log("Error Fetching Stocks", err);
      });
  }, 1000);
});

function display(stocks) {
  productContainer.innerHTML = "";
  if (stocks.length === 0) {
    productContainer.innerHTML = "<h3>No Stocks detected</h3>";
    return;
  } else {
    let slicedStocks = stocks.slice(0, 7);
    slicedStocks.forEach((stock) => {
      let stockContainer = document.createElement("div");
      stockContainer.className = "stock-item";
      stockContainer.innerHTML = `<h3>${stock["Issuer Name"]} (${stock["Security Id"]})</h3>`;
        productContainer.appendChild(stockContainer);
        
      stockContainer.addEventListener("click", () => {
        fetch("/setLimit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stock),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              window.location.href = "/setLimit";
            } else {
              console.error("Failed to set limits");
            }
          })
          .catch((err) => {
            console.error("Error:", err);
          });
      });
    });
  }
}
