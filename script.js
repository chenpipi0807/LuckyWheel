document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    const optionsList = document.getElementById('optionsList');
    const probabilityDisplay = document.getElementById('probabilityDisplay');
    const wheel = document.getElementById('wheel');
    const spinBtn = document.getElementById('spinBtn');
    const result = document.getElementById('result');
    const addOptionBtn = document.getElementById('addOption');
    const constantModeBtn = document.getElementById('constantMode');
    const decreasingModeBtn = document.getElementById('decreasingMode');
    const averageProbModeBtn = document.getElementById('averageProbMode');
    const increasingProbModeBtn = document.getElementById('increasingProbMode');
    
    // Colors for wheel sections (Morandi palette)
    const colors = [
        '#a99f94', '#c8c2b6', '#d1beb0', '#e0c9b1',
        '#b5b3a7', '#b2a595', '#d8cdc4', '#c5bbae'
    ];
    
    // Default options
    let options = [
        { id: 1, text: '一等奖' },
        { id: 2, text: '二等奖' },
        { id: 3, text: '三等奖' }
    ];
    
    // Mode: 'constant' or 'decreasing'
    let currentMode = 'constant';
    let probabilityMode = 'average';
    let isSpinning = false;
    let isDragging = false;
    let dragStartAngle = 0;
    let currentRotation = 0;
    let nextId = 4; // For generating unique IDs
    
    // Wheel physics variables
    let startAngle = 0;
    let lastMouseAngle = 0;
    let spinVelocity = 0;
    let spinningTimeoutId = null;
    let lastFrameTime = 0;
    
    // Initialize the app
    function init() {
        renderOptions();
        updateProbabilities();
        renderWheel();
        setupEventListeners();
    }
    
    // Render options in the sidebar
    function renderOptions() {
        optionsList.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option-item';
            optionElement.dataset.id = option.id;
            
            optionElement.innerHTML = `
                <input type="text" class="option-input" value="${option.text}" placeholder="输入选项">
                <button class="option-btn delete-btn"><i class="fas fa-trash"></i></button>
            `;
            
            optionsList.appendChild(optionElement);
        });
        
        // Add event listeners to the newly created elements
        document.querySelectorAll('.option-input').forEach(input => {
            input.addEventListener('input', handleOptionEdit);
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleOptionDelete);
        });
    }
    
    // Calculate and update probabilities
    function updateProbabilities() {
        if (options.length === 0) {
            probabilityDisplay.innerHTML = '<p>没有选项</p>';
            return;
        }
        
        let probabilities = [];
        
        if (probabilityMode === 'average') {
            // Calculate average probability
            const totalOptions = options.length;
            const totalValues = options.reduce((sum, opt) => sum + 1, 0);
            
            options.forEach(option => {
                const probability = (1 / totalValues) * 100;
                probabilities.push({
                    id: option.id,
                    text: option.text,
                    probability
                });
            });
        } else if (probabilityMode === 'increasing') {
            // Calculate increasing probability (higher values have lower probabilities)
            const totalOptions = options.length;
            
            // Sort options by value in descending order
            const sortedOptions = [...options].sort((a, b) => b.id - a.id);
            
            // Calculate weight based on position
            let totalWeight = 0;
            const weights = [];
            
            for (let i = 0; i < sortedOptions.length; i++) {
                // Formula: giving higher positions (i) lower weights
                const weight = 1 / (i + 1);
                weights.push(weight);
                totalWeight += weight;
            }
            
            // Calculate probability for each option
            sortedOptions.forEach((option, index) => {
                const probability = (weights[index] / totalWeight) * 100;
                probabilities.push({
                    id: option.id,
                    text: option.text,
                    probability
                });
            });
            
            // Re-sort probabilities to match original order
            probabilities.sort((a, b) => {
                const indexA = options.findIndex(opt => opt.id === a.id);
                const indexB = options.findIndex(opt => opt.id === b.id);
                return indexA - indexB;
            });
        }
        
        probabilityDisplay.innerHTML = '';
        probabilities.forEach(item => {
            const probItem = document.createElement('div');
            probItem.className = 'probability-item';
            probItem.innerHTML = `
                <span>${item.text}</span>
                <span>${item.probability.toFixed(2)}%</span>
            `;
            probabilityDisplay.appendChild(probItem);
        });
    }
    
    // Render the wheel with sections
    function renderWheel() {
        wheel.innerHTML = '';
        
        if (options.length === 0) {
            // Display a message if there are no options
            wheel.style.background = '#f0ede7';
            return;
        }
        
        const sectionAngle = 360 / options.length;
        const wheelSize = wheel.clientWidth; // Get the current wheel size
        const radius = wheelSize / 2;
        const center = radius;
        
        // Create SVG
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("viewBox", `0 0 ${wheelSize} ${wheelSize}`);
        svg.style.position = "absolute";
        svg.style.top = "0";
        svg.style.left = "0";
        
        // Create a circle for the background
        const background = document.createElementNS(svgNS, "circle");
        background.setAttribute("cx", center);
        background.setAttribute("cy", center);
        background.setAttribute("r", radius);
        background.setAttribute("fill", "#f0ede7");
        svg.appendChild(background);
        
        // Create pie slices for each section
        options.forEach((option, index) => {
            const startAngle = index * sectionAngle;
            const endAngle = startAngle + sectionAngle;
            
            // Convert angles to radians
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad = (endAngle - 90) * Math.PI / 180;
            
            // Calculate coordinates
            const x1 = center + radius * Math.cos(startRad);
            const y1 = center + radius * Math.sin(startRad);
            const x2 = center + radius * Math.cos(endRad);
            const y2 = center + radius * Math.sin(endRad);
            
            // Create path for this section
            const path = document.createElementNS(svgNS, "path");
            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
            
            const d = [
                `M ${center} ${center}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                "Z"
            ].join(" ");
            
            path.setAttribute("d", d);
            path.setAttribute("fill", colors[index % colors.length]);
            svg.appendChild(path);
            
            // Add a line from center to the edge for the dividing line
            const line = document.createElementNS(svgNS, "line");
            line.setAttribute("x1", center);
            line.setAttribute("y1", center);
            line.setAttribute("x2", x1);
            line.setAttribute("y2", y1);
            line.setAttribute("stroke", "white");
            line.setAttribute("stroke-width", "2");
            svg.appendChild(line);
            
            // Add text
            const textAngle = startAngle + sectionAngle / 2;
            const textRad = (textAngle - 90) * Math.PI / 180;
            const textDistance = radius * 0.65; // 65% from center
            const textX = center + textDistance * Math.cos(textRad);
            const textY = center + textDistance * Math.sin(textRad);
            
            const text = document.createElementNS(svgNS, "text");
            text.setAttribute("x", textX);
            text.setAttribute("y", textY);
            text.setAttribute("fill", "white");
            text.setAttribute("font-size", "14");
            text.setAttribute("font-weight", "bold");
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("dominant-baseline", "middle");
            text.setAttribute("transform", `rotate(${textAngle}, ${textX}, ${textY})`);
            text.textContent = option.text;
            
            // Add a filter for text shadow
            text.setAttribute("filter", "url(#text-shadow)");
            
            svg.appendChild(text);
        });
        
        // Create a filter for text shadow
        const defs = document.createElementNS(svgNS, "defs");
        const filter = document.createElementNS(svgNS, "filter");
        filter.setAttribute("id", "text-shadow");
        filter.setAttribute("x", "-20%");
        filter.setAttribute("y", "-20%");
        filter.setAttribute("width", "140%");
        filter.setAttribute("height", "140%");
        
        const feDropShadow = document.createElementNS(svgNS, "feDropShadow");
        feDropShadow.setAttribute("dx", "0");
        feDropShadow.setAttribute("dy", "0");
        feDropShadow.setAttribute("stdDeviation", "1");
        feDropShadow.setAttribute("flood-color", "black");
        feDropShadow.setAttribute("flood-opacity", "0.5");
        
        filter.appendChild(feDropShadow);
        defs.appendChild(filter);
        svg.appendChild(defs);
        
        // Append SVG to the wheel
        wheel.appendChild(svg);
        
        // Add center piece on top
        const center_piece = document.createElement('div');
        center_piece.className = 'wheel-center';
        wheel.appendChild(center_piece);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Add new option button
        addOptionBtn.addEventListener('click', handleAddOption);
        
        // Mode selection
        constantModeBtn.addEventListener('click', () => switchMode('constant'));
        decreasingModeBtn.addEventListener('click', () => switchMode('decreasing'));
        
        // Probability mode selection
        averageProbModeBtn.addEventListener('click', () => switchProbabilityMode('average'));
        increasingProbModeBtn.addEventListener('click', () => switchProbabilityMode('increasing'));
        
        // Spin button
        spinBtn.addEventListener('click', handleSpin);
        
        // Mouse drag for wheel
        wheel.addEventListener('mousedown', handleWheelMouseDown);
        document.addEventListener('mousemove', handleWheelMouseMove);
        document.addEventListener('mouseup', handleWheelMouseUp);
        
        // Touch events for mobile
        wheel.addEventListener('touchstart', handleWheelTouchStart);
        document.addEventListener('touchmove', handleWheelTouchMove);
        document.addEventListener('touchend', handleWheelTouchEnd);
    }
    
    // Handle adding a new option
    function handleAddOption() {
        options.push({ id: nextId++, text: '新选项' });
        renderOptions();
        updateProbabilities();
        renderWheel();
    }
    
    // Handle editing an option
    function handleOptionEdit(event) {
        const input = event.target;
        const id = parseInt(input.closest('.option-item').dataset.id);
        const option = options.find(opt => opt.id === id);
        
        if (option) {
            option.text = input.value;
            updateProbabilities();
            renderWheel();
        }
    }
    
    // Handle deleting an option
    function handleOptionDelete(event) {
        const btn = event.target.closest('.delete-btn');
        if (!btn) return;
        
        const id = parseInt(btn.closest('.option-item').dataset.id);
        options = options.filter(opt => opt.id !== id);
        
        renderOptions();
        updateProbabilities();
        renderWheel();
    }
    
    // Switch between constant and decreasing modes
    function switchMode(mode) {
        currentMode = mode;
        
        // Update UI
        if (mode === 'constant') {
            constantModeBtn.classList.add('active');
            decreasingModeBtn.classList.remove('active');
        } else {
            constantModeBtn.classList.remove('active');
            decreasingModeBtn.classList.add('active');
        }
    }
    
    // Switch between average and increasing probability modes
    function switchProbabilityMode(mode) {
        probabilityMode = mode;
        
        // Update UI
        if (mode === 'average') {
            averageProbModeBtn.classList.add('active');
            increasingProbModeBtn.classList.remove('active');
        } else {
            averageProbModeBtn.classList.remove('active');
            increasingProbModeBtn.classList.add('active');
        }
        
        updateProbabilities();
    }
    
    // Handle spinning the wheel
    function handleSpin() {
        if (isSpinning || options.length === 0) return;
        
        isSpinning = true;
        result.textContent = '';
        
        // Get current rotation
        const currentRotation = getRotationDegrees(wheel);
        
        // 计算扇区角度
        const sectionAngle = 360 / options.length;
        
        // 添加随机偏移量，确保指针停在扇区中间区域，而不是边界线上
        // 随机偏移量为扇区角度的20%-80%之间的随机值
        const randomOffset = sectionAngle * (0.2 + Math.random() * 0.6);
        
        // Generate random rotation (between 5 and 10 full rotations) + random offset
        const extraRotations = (Math.floor(Math.random() * 5) + 5) * 360;
        const targetRotation = currentRotation + extraRotations + randomOffset;
        
        // Determine the winning option index
        // 使用floor确保结果落在扇区内部
        const finalAngle = targetRotation % 360;
        const winningIndex = Math.floor(finalAngle / sectionAngle);
        const winningOption = options[options.length - 1 - winningIndex];
        
        // Apply the rotation animation
        wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
        wheel.style.transform = `rotate(${targetRotation}deg)`;
        
        // After the spin is complete
        setTimeout(() => {
            isSpinning = false;
            result.textContent = `恭喜获得：${winningOption.text}`;
            
            // In decreasing mode, remove the winning option
            if (currentMode === 'decreasing') {
                options = options.filter(opt => opt.id !== winningOption.id);
                renderOptions();
                updateProbabilities();
                
                // Don't immediately re-render the wheel to avoid visual jumpiness
                setTimeout(() => {
                    wheel.style.transition = 'none';
                    renderWheel();
                    
                    // Reset the wheel position for smooth future spins
                    setTimeout(() => {
                        wheel.style.transform = 'rotate(0deg)';
                        setTimeout(() => {
                            wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
                        }, 50);
                    }, 50);
                }, 1000);
            }
        }, 5000);
    }
    
    // Get current rotation in degrees
    function getRotationDegrees(element) {
        const style = window.getComputedStyle(element);
        const matrix = new WebKitCSSMatrix(style.transform);
        
        // Extract rotation from the matrix
        const angle = Math.atan2(matrix.b, matrix.a);
        const degrees = angle * (180 / Math.PI);
        
        return (degrees < 0) ? degrees + 360 : degrees;
    }
    
    // Mouse drag functionality for the wheel
    function handleWheelMouseDown(event) {
        if (isSpinning) return;
        
        isDragging = true;
        wheel.style.transition = 'none';
        
        // Calculate the center of the wheel
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate the angle
        startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
        currentRotation = getRotationDegrees(wheel);
        lastMouseAngle = startAngle;
        lastFrameTime = performance.now();
        
        // Clear any previous spinning
        if (spinningTimeoutId) {
            clearTimeout(spinningTimeoutId);
        }
    }
    
    function handleWheelMouseMove(event) {
        if (!isDragging || isSpinning) return;
        
        // Calculate the center of the wheel
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Calculate the current angle
        const mouseAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * (180 / Math.PI);
        const angleDelta = mouseAngle - lastMouseAngle;
        
        // Update the wheel rotation
        currentRotation += angleDelta;
        wheel.style.transform = `rotate(${currentRotation}deg)`;
        
        // Calculate velocity for momentum
        const now = performance.now();
        const deltaTime = now - lastFrameTime;
        if (deltaTime > 0) {
            spinVelocity = angleDelta / deltaTime * 20; // Scale for better feel
        }
        
        lastMouseAngle = mouseAngle;
        lastFrameTime = now;
    }
    
    function handleWheelMouseUp() {
        if (!isDragging || isSpinning) return;
        
        isDragging = false;
        
        // Apply momentum-based spinning
        if (Math.abs(spinVelocity) > 0.1) {
            applyMomentumSpin();
        }
    }
    
    // Touch events for mobile
    function handleWheelTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            // Create a synthetic mouse event
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            handleWheelMouseDown(mouseEvent);
        }
    }
    
    function handleWheelTouchMove(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            // Create a synthetic mouse event
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            handleWheelMouseMove(mouseEvent);
            event.preventDefault(); // Prevent scrolling while dragging
        }
    }
    
    function handleWheelTouchEnd() {
        handleWheelMouseUp();
    }
    
    // Apply momentum-based spinning
    function applyMomentumSpin() {
        if (isSpinning) return;
        
        // Only apply if velocity is significant
        if (Math.abs(spinVelocity) > 0.5) {
            isSpinning = true;
            
            // Get current rotation
            const currentRotation = getRotationDegrees(wheel);
            
            // Calculate extra rotation based on velocity
            const extraRotation = spinVelocity * 100;
            const targetRotation = currentRotation + extraRotation;
            
            // Apply the rotation
            wheel.style.transform = `rotate(${targetRotation}deg)`;
            
            // Determine the winning section after spinning
            spinningTimeoutId = setTimeout(() => {
                // Only calculate winner if momentum was significant
                if (Math.abs(extraRotation) > 360) {
                    const finalAngle = targetRotation % 360;
                    const sectionAngle = 360 / options.length;
                    const winningIndex = Math.floor(finalAngle / sectionAngle);
                    
                    try {
                        const winningOption = options[options.length - 1 - winningIndex];
                        result.textContent = `恭喜获得：${winningOption.text}`;
                    } catch (e) {
                        // Handle edge case if options changed during spin
                        console.error('Error determining winning option:', e);
                    }
                }
                
                isSpinning = false;
            }, 1000);
        } else {
            // Slow down until stopped
            spinVelocity = 0;
            isDragging = false;
        }
    }
    
    // Start the app
    init();
});
