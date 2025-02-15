(function () {
    // 1. Store 제목 찾기
    const storeHeading = document.querySelector('h1.flex.items-center.justify-center.gap-2.text-2xl.sm\\:text-3xl.font-black.text-cream');
    if (!storeHeading) {
        console.error('Store heading not found');
        return;
    }

    // 2. 돋보기 아이콘 추가
    const searchIcon = document.createElement('span');
    searchIcon.innerHTML = '🔍'; // 돋보기 아이콘 (이모지 사용)
    searchIcon.style.cursor = 'pointer';
    searchIcon.style.marginLeft = '10px'; // 간격 조정
    searchIcon.title = 'Analyze Efficiency'; // 툴팁 추가
    storeHeading.appendChild(searchIcon);

    // 3. 번개 실행 아이콘 추가
    const executeIcon = document.createElement('span');
    executeIcon.innerHTML = '⚡'; // 번개 아이콘 (이모지 사용)
    executeIcon.style.cursor = 'pointer';
    executeIcon.style.marginLeft = '10px'; // 간격 조정
    executeIcon.title = 'Execute Purchase'; // 툴팁 추가
    storeHeading.appendChild(executeIcon);

    // 4. Auto 토글 버튼 추가
    const autoToggle = document.createElement('span');
    autoToggle.innerHTML = '🔄'; // Auto 토글 아이콘 (이모지 사용)
    autoToggle.style.cursor = 'pointer';
    autoToggle.style.marginLeft = '10px'; // 간격 조정
    autoToggle.title = 'Toggle Auto Mode'; // 툴팁 추가
    autoToggle.dataset.active = 'false'; // 초기 상태: 비활성화
    storeHeading.appendChild(autoToggle);

    // 5. 돋보기 아이콘 클릭 이벤트 추가
    searchIcon.addEventListener('click', () => {
        analyzeEquipmentEfficiency(); // 스크립트 실행
    });

    // 6. 번개 아이콘 클릭 이벤트 추가
    executeIcon.addEventListener('click', () => {
        clickPurchaseButton(); // Purchase 버튼 클릭
    });

    // 7. Auto 토글 버튼 클릭 이벤트 추가
    autoToggle.addEventListener('click', () => {
        const isActive = autoToggle.dataset.active === 'true';
        if (isActive) {
            autoToggle.dataset.active = 'false';
            autoToggle.style.color = ''; // 기본 색상으로 복원
            console.log('Auto mode deactivated.');
        } else {
            autoToggle.dataset.active = 'true';
            autoToggle.style.color = 'green'; // 활성화 상태 강조
            console.log('Auto mode activated.');
            runAutoMode(); // Auto 모드 실행
        }
    });

    // 8. Purchase 버튼 클릭 함수
    function clickPurchaseButton() {
        const purchaseButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Purchase');

        if (purchaseButton) {
            purchaseButton.click();
            console.log('Purchase button clicked!');
            return true; // 클릭 성공
        } else {
            console.error('Purchase button not found!');
            return false; // 버튼 없음
        }
    }

    // 9. Auto 모드 실행 함수
    async function runAutoMode() {
        while (autoToggle.dataset.active === 'true') {
            console.log('Running Auto Mode...');

            // 1. Loading 상태 확인
            const loadingElement = document.querySelector('div[aria-label="Loading"]');
            if (loadingElement) {
                console.log('Loading detected. Pausing...');
                // Loading 상태가 사라질 때까지 대기
                while (document.querySelector('div[aria-label="Loading"]')) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초마다 체크
                }
                await new Promise(resolve => setTimeout(resolve, 2000)); // 약간의 딜레이 추가
                console.log('Loading finished. Resuming...');
            }

            // 2. 돋보기 실행
            await analyzeEquipmentEfficiency();
            await new Promise(resolve => setTimeout(resolve, 500));
            // 3. 번개 실행
            clickPurchaseButton();

            // 4. 1초 대기
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('Auto mode stopped.');
    }

    // 10. 장비 효율 분석 함수 (기존 코드)
    async function analyzeEquipmentEfficiency() {
        const equipmentSection = Array.from(document.querySelectorAll('section')).find(section =>
            section.querySelector('h3')?.textContent.includes('Equipment')
        );

        if (!equipmentSection) return;

        const buttons = Array.from(equipmentSection.querySelectorAll('button'));

        // Reset styles for all buttons
        buttons.forEach(button => {
            const nameElement = button.querySelector('.font-bold');
            if (nameElement) {
                nameElement.style.color = ''; // Reset color to default
                nameElement.style.fontWeight = ''; // Reset font weight to default
            }
        });

        const extractNumber = (text) => {
            if (text.includes('K')) {
                return parseFloat(text.replace(/[^0-9.]/g, '')) * 1000;
            }
            return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
        };

        const equipmentInfo = {};

        for (const [index, button] of buttons.entries()) {
            let name = 'Unknown';
            try {
                name = button.querySelector('.font-bold')?.textContent.trim() || 'Unknown';
                const priceText = button.querySelector('.font-black')?.textContent.trim() || '0';
                const price = extractNumber(priceText);

                const quantityElement = button.querySelector('p.flex.items-center.justify-center.gap-2.text-sm.sm\\:text-base.font-bold.text-green');
                const quantityText = quantityElement?.textContent.trim() || '0';
                const quantity = extractNumber(quantityText);

                button.click();
                await new Promise(resolve => setTimeout(resolve, 50));

                const allParagraphs = document.querySelectorAll('p');
                let mps = 0;

                for (const p of allParagraphs) {
                    if (p.textContent.includes('Moola/s')) {
                        mps = extractNumber(p.textContent.trim());
                        break;
                    }
                }

                const uniqueKey = `${name}_${index}`;
                const efficiency = mps / price;

                equipmentInfo[uniqueKey] = {
                    name,
                    price,
                    unitMps: mps,
                    efficiency: efficiency.toFixed(6),
                    index
                };

                const closeButton = document.querySelector('.modal-close-button');
                if (closeButton) {
                    closeButton.click();
                } else {
                    const modal = document.querySelector('.modal');
                    if (modal) modal.remove();
                }

                await new Promise(resolve => setTimeout(resolve, 50));

            } catch (error) {
                console.error(`Error processing ${name}:`, error);
            }
        }

        const sortedEquipment = Object.values(equipmentInfo).sort((a, b) => b.efficiency - a.efficiency);

        if (sortedEquipment.length > 0) {
            const mostEfficientItem = sortedEquipment[0];
            const targetButton = buttons[mostEfficientItem.index];

            if (targetButton) {
                const targetNameElement = targetButton.querySelector('.font-bold');
                if (targetNameElement) {
                    targetNameElement.style.color = 'red'; // 효율이 가장 높은 아이템 강조
                    targetNameElement.style.fontWeight = 'bold';
                }

                // 스크롤을 해당 버튼으로 이동
                targetButton.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // 효율이 가장 좋은 아이템 클릭
                targetButton.click();

                // 마지막 아이템인 경우 한 번 더 클릭
                if (mostEfficientItem.index === buttons.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100)); // 약간의 딜레이 추가
                    targetButton.click(); // 다시 클릭
                }
            }
        }
    }
})();