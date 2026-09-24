package com.cafeteria.service.impl;
import com.cafeteria.dto.request.CategoryRequest; import com.cafeteria.dto.response.CategoryResponse; import com.cafeteria.entity.Category; import com.cafeteria.exception.CategoryNotFoundException; import com.cafeteria.repository.CategoryRepository; import com.cafeteria.service.CategoryService; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.List;
@Service public class CategoryServiceImpl implements CategoryService{
 private final CategoryRepository repo; public CategoryServiceImpl(CategoryRepository repo){this.repo=repo;}
 @Transactional public CategoryResponse createCategory(CategoryRequest r){Category c=new Category(); c.setName(r.name()); c.setDescription(r.description()); c.setDisplayOrder(r.displayOrder()); c.setIsActive(r.isActive()!=null?r.isActive():true); return to(repo.save(c));}
 @Transactional public CategoryResponse updateCategory(Long id,CategoryRequest r){Category c=get(id); c.setName(r.name()); c.setDescription(r.description()); c.setDisplayOrder(r.displayOrder()); if(r.isActive()!=null)c.setIsActive(r.isActive()); return to(c);}
 @Transactional public CategoryResponse setCategoryActive(Long id,boolean a){Category c=get(id);c.setIsActive(a);return to(c);}
 @Transactional(readOnly=true) public List<CategoryResponse> getAllCategories(){return repo.findAll().stream().map(this::to).toList();}
 @Transactional(readOnly=true) public List<CategoryResponse> getActiveCategories(){return repo.findByIsActiveTrueOrderByDisplayOrderAsc().stream().map(this::to).toList();}
 private Category get(Long id){return repo.findById(id).orElseThrow(()->new CategoryNotFoundException("Category not found: id="+id));}
 private CategoryResponse to(Category c){return new CategoryResponse(c.getCategoryId(),c.getName(),c.getDescription(),c.getDisplayOrder(),c.getIsActive());}
}
