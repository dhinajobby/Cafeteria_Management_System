package com.cafeteria.service.impl;
import com.cafeteria.dto.request.MenuItemRequest; import com.cafeteria.dto.response.MenuItemResponse; import com.cafeteria.entity.*; import com.cafeteria.exception.*; import com.cafeteria.repository.*; import com.cafeteria.service.MenuItemService; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.math.BigDecimal; import java.util.List;
@Service public class MenuItemServiceImpl implements MenuItemService{
 private final MenuItemRepository itemRepo; private final CategoryRepository categoryRepo; public MenuItemServiceImpl(MenuItemRepository i,CategoryRepository c){itemRepo=i;categoryRepo=c;}
 @Transactional public MenuItemResponse addItem(MenuItemRequest r){Category c=category(r.categoryId());validate(r);MenuItem m=new MenuItem();apply(m,r,c);return to(itemRepo.save(m));}
 @Transactional public MenuItemResponse updateItem(Long id,MenuItemRequest r){MenuItem m=get(id);Category c=category(r.categoryId());validate(r);apply(m,r,c);return to(m);}
 @Transactional public MenuItemResponse updatePrice(Long id,BigDecimal p){if(p==null||p.signum()<=0)throw new InvalidOperationException("Price must be greater than zero.");MenuItem m=get(id);m.setPrice(p);return to(m);}
 @Transactional public MenuItemResponse updateStock(Long id,Integer q){validateStock(q);MenuItem m=get(id);m.setStockQuantity(q);return to(m);}
 @Transactional public MenuItemResponse setAvailability(Long id,boolean a){MenuItem m=get(id);m.setIsAvailable(a);return to(m);}
 @Transactional public MenuItemResponse deactivateItem(Long id){return setAvailability(id,false);}@Transactional
public void deleteItem(Long id){
    if(!itemRepo.existsById(id)){
        throw new ItemNotFoundException("Menu item not found: id=" + id);
    }
    itemRepo.deleteById(id);
}
 @Transactional(readOnly=true) public List<MenuItemResponse> getAvailableItemsByCategory(Long id){return itemRepo.findByCategory_CategoryIdAndIsAvailableTrue(id).stream().map(this::to).toList();}
 @Transactional(readOnly=true) public List<MenuItemResponse> getAllItemsForAdmin(){return itemRepo.findAll().stream().map(this::to).toList();}
 @Transactional(readOnly=true) public List<MenuItemResponse> getAvailableItems(){return itemRepo.findByIsAvailableTrue().stream().map(this::to).toList();}
 private Category category(Long id){if(id==null)throw new CategoryNotFoundException("Category id is required.");return categoryRepo.findById(id).orElseThrow(()->new CategoryNotFoundException("Category not found: id="+id));}
 private MenuItem get(Long id){return itemRepo.findById(id).orElseThrow(()->new ItemNotFoundException("Menu item not found: id="+id));}
 private void validate(MenuItemRequest r){if(r.name()==null||r.name().isBlank())throw new InvalidOperationException("Item name is required.");if(r.price()==null||r.price().signum()<=0)throw new InvalidOperationException("Price must be greater than zero.");validateStock(r.stockQuantity());}
 private void validateStock(Integer q){if(q!=null&&q<0)throw new InvalidQuantityException("Stock quantity cannot be negative.");}
 private void apply(MenuItem m,MenuItemRequest r,Category c){m.setCategory(c);m.setName(r.name());m.setDescription(r.description());m.setPrice(r.price());m.setImageUrl(r.imageUrl());m.setIsAvailable(r.isAvailable()!=null?r.isAvailable():true);m.setStockQuantity(r.stockQuantity());}
 private MenuItemResponse to(MenuItem m){return new MenuItemResponse(m.getItemId(),m.getCategory().getCategoryId(),m.getCategory().getName(),m.getName(),m.getDescription(),m.getPrice(),m.getImageUrl(),m.getIsAvailable(),m.getStockQuantity());}
}
