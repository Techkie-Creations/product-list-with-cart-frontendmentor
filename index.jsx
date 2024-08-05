let App = () => {
	// STATES
	const [desserts, setDesserts] = React.useState([]);
	const [cartItems, setCartItems] = React.useState(
		JSON.parse(localStorage.getItem("cartItems")) || {}
	);

	// RENDER EFFECT
	React.useEffect(() => {
		dessert_list();
		total();
	}, []);

	// SELECTED DESSERTS
	let actives = (action = "none", name = "none") => {
		[...Object.keys(cartItems)].forEach((key) =>
			document.getElementById(key).setAttribute("class", "dessert-img active")
		);
		if (action === "add") {
			document.getElementById(name).setAttribute("class", "dessert-img active");
		} else if (action === "remove") {
			document.getElementById(name).setAttribute("class", "dessert-img");
		}
		if (action === "remove-all") {
			[...desserts].map((remove) =>
				document
					.getElementById(remove.name)
					.setAttribute("class", "dessert-img")
			);
		}
	};

	// DESSERT LIST FOR GRID
	const dessert_list = async () => {
		await axios.get("./data.json").then((res) => {
			const data = res;
			setDesserts(data.data);
		});
		actives();
	};

	// HANDLE CLICK TO ADD ITEM AND AMOUNT
	let handleClick = (crement = "", name, price, inital = false) => {
		if (inital === true) {
			setCartItems((prev) => ({
				...prev,
				[`${name}`]: [1, price],
			}));
		} else if (crement === "increment") {
			setCartItems((prev) => ({
				...prev,
				[`${name}`]: [cartItems[name][0] + 1, price],
			}));
		} else if (crement === "decrement") {
			if (cartItems[name][0] > 1) {
				setCartItems((prev) => ({
					...prev,
					[`${name}`]: [cartItems[name][0] - 1, price],
				}));
			}
		}
	};

	// SETTING LOCALSTORAGE AS PSUEDO-DATABASE
	localStorage.setItem("cartItems", JSON.stringify(cartItems));

	// CALCULCATING TOTAL IN GENERAL AND PER ITEM
	let total = (choice) => {
		let sum = 0;
		if (choice === "item") {
			[...Object.keys(cartItems)].forEach((item) => {
				sum += cartItems[item][0];
			});
		}
		if (choice === "total") {
			[...Object.keys(cartItems)].forEach((item) => {
				sum += cartItems[item][0] * cartItems[item][1];
			});
		}

		return sum;
	};

	// HANDLE REMOVING ITEMS FROM CART
	let handleRemove = (name) => {
		setCartItems((current) => {
			const { [name]: _, ...rest } = current;
			return rest;
		});
	};

	// FORMATTING THE VALUES DISPLAYED
	let formatter = (value) => {
		return value.toString().indexOf(".") === -1
			? value.toString() + ".00"
			: value.toString().slice(value.toString().indexOf(".") + 1).length < 2
			? value.toString() + "0"
			: value.toString();
	};

	return (
		<>
			<div id="veil" className="none">
				{/* CONFIRM CART */}
				<div className="confirm-cart">
					<div className="confirm-inner">
						<div className="confirm-icon">
							<Svg item={"confirm"} />
						</div>
						<h2 className="confirm-title">Order Confirmed</h2>
						<p className="confirm-text">We hope you enjoy your food!</p>
						<div className="confirm-items">
							{[...desserts]
								.filter(
									(dessert) =>
										[...Object.keys(cartItems)].indexOf(dessert.name) >= 0
								)
								.map((key, idx) => (
									<div className="citems" key={idx}>
										<img
											src={key.image.thumbnail}
											alt={`${key.name} thumbnail`}
											className="citems-img"
										/>
										<div className="item-info">
											<div className="left-info">
												<h3 className="citem-name">{key.name}</h3>
												<p className="amount-price">
													<span className="citem-amount">
														{cartItems[key.name][0]}x
													</span>
													<span className="citem-price">
														@ ${formatter(key.price)}
													</span>
												</p>
											</div>
											<h4 className="citems-total">
												$
												{formatter(
													parseInt(cartItems[key.name][0]) *
														parseFloat(cartItems[key.name][1])
												)}
											</h4>
										</div>
									</div>
								))}
							<div className="confirm-total">
								<p className="ctotal-text">Order Total</p>
								<h2 className="ctotal-amt">${formatter(total("total"))}</h2>
							</div>
						</div>
						<button
							className="new-cart"
							onClick={() => {
								localStorage.clear();
								setCartItems({});
								actives("remove-all", "");
								document.getElementById("veil").setAttribute("class", "none");
							}}
						>
							Start New Order
						</button>
					</div>
				</div>
			</div>
			<div className="desserts-holder">
				{/* DESSERT GRID */}
				<div className="dessert-section">
					<h1>Desserts</h1>
					<div className="dessert-grid">
						{desserts.map((e, i) => (
							<div className="dessert" key={i}>
								<img
									src={e.image.desktop}
									alt={e.name}
									className={`dessert-img`}
									id={e.name}
								/>

								<div className="controls">
									{cartItems[e.name] ? (
										<div className="cart-control crements">
											<p
												className={`circle`}
												aria-hidden="true"
												onClick={() => {
													handleClick("decrement", e.name, e.price);
												}}
											>
												<i className="fa fa-minus" aria-hidden="true"></i>{" "}
											</p>
											{cartItems[e.name][0]}{" "}
											<p
												className="circle"
												aria-hidden="true"
												onClick={() => {
													handleClick("increment", e.name, e.price);
												}}
											>
												<i className="fa fa-plus" aria-hidden="true"></i>
											</p>
										</div>
									) : (
										<button
											className="cart-control add-cart"
											onClick={() => {
												handleClick("", e.name, e.price, true);
												actives("add", e.name);
											}}
										>
											<Svg fillColor="hsl(14, 65%, 9%)" item="cart" />
											Add to Cart
										</button>
									)}
								</div>
								<div className="dessert-details">
									<p className="category">{e.category}</p>
									<h4 className="dessert-name">{e.name}</h4>
									<span className="price">${formatter(e.price)}</span>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* DESSERT CART */}
				<div className="cart">
					<h2 className="cart-title">Your Cart ({total("item")})</h2>
					{total("item") >= 1 ? (
						<div>
							{[...Object.keys(cartItems)].map((item, idx) => (
								<div className="contain-fill">
									<div key={idx} className="filled-cart">
										<div className="item-details">
											<h4>{item}</h4>
											<div className="details-info">
												<p className="amount">{cartItems[item][0]}x</p>
												<p className="price">
													@ ${formatter(cartItems[item][1])}
												</p>
												<p className="item-total">
													$
													{formatter(
														parseInt(cartItems[item][0]) *
															parseFloat(cartItems[item][1])
													)}
												</p>
											</div>
										</div>
										<span
											className="remove"
											onClick={() => {
												handleRemove(item);
												actives("remove", item);
											}}
										>
											<Svg item={"remove"} />
										</span>
									</div>
									<hr />
								</div>
							))}
							<div className="total-sect">
								<p className="total-text">Order Total</p>
								<h2> ${formatter(total("total"))}</h2>
							</div>
							<div className="carbon-free">
								<Svg item={"neutral"} />{" "}
								<p>
									This is a <b> carbon-neutral </b> delivery
								</p>
							</div>
							<button
								className="complete done"
								onClick={() => {
									document.getElementById("veil").removeAttribute("class");
									document.body.scrollTop = 0;
									document.documentElement.scrollTop = 0;
								}}
							>
								Confirm Order
							</button>
						</div>
					) : (
						<div className="empty-cart">
							<Svg item={"empty"} />
							<p className="empty-text">Your added items will appear here</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

ReactDOM.render(<App />, document.getElementById("root"));
