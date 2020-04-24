import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { SettingsService } from '../settings.service'
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';
import { Category } from '../Models/Category';
import { ContentSource } from '../Models/Category';
import { ContentSourceViewModel } from '../Models/Category';
import { Select2OptionData } from 'ng-select2';
import { Observable } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HelperService } from 'src/app/services/helper.service';
import { SubSink } from 'subsink';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  errorOccurred = false;
  optionalCategories: any = [];
  mandatoryCategories: any = [];
  newMandatory: any = [];
  enable = "true";
  categoryName: string;
  categoryId: any;
  //categoryType: string;
  categoryUpdated = false;
  categoryType = "mandatory";
  categoryLengthValidation = false;
  categoryEmptyValidation = false;
  enableSaveCategory = false;
  autoApprovedContentSources: [];
  nonAutoApprovedContentSources: [];
  allSources: Array<object>;
  categoryList: Observable<Array<Select2OptionData>>;
  selectedCategoryId: '0';
  isAutoApprovedSource = false;
  isNonAutoApprovedSource = false;
  isCategoryEdit = false;
  isShowValidation = true;
  optionalCategoryLength: any;
  mandatoryCategoryLength: any;
  getCategoryLoader = true;
  categoryCurrentPage = 1;
  mandatorycategoryCurrentPage = 1;
  pageSize = 10;
  categorySearchText = '';
  feedCategories: any;
  showCategoryStatus = false;
  createCategoryPopupTitle = "Create Category";
  allCategoryFeeds: any;
  feedSearchText = '';
  enbaleOrdisableFilter = false;
  mandatoryTemp: [];
  isMandatoryTab = true;
  editOrCreateButton: any;
  private subs = new SubSink();
  @ViewChild('createcategory') createcategory: NgForm;
  categoryCounter = 0;
  constructor(private settingsService: SettingsService, private apiService: ApiService,
    private modalService: NgbModal, private toastService: ToastService, private helper: HelperService) { }

  ngOnInit() {
    this.getCategories();
  }

  ShowError(error: HttpErrorResponse) {
    this.errorOccurred = true;
    this.apiService.handleApiException(error);
  }

  getCategories() {
    this.subs.sink = this.settingsService.getCategories().subscribe(
      (success) => {
        this.getCategoryLoader = false;
        this.setCategories(success);
      },
      (error) => { this.ShowError(error); }
    );
  }

  setCategories(response) {
    this.categoryCurrentPage = 1;
    this.mandatorycategoryCurrentPage = 1;
    this.optionalCategories = response.OptionalCategories;
    this.mandatoryCategories = response.ManadatoryCategories;
    this.mandatoryCategoryLength = response.ManadatoryCategories.length;
    this.optionalCategoryLength = response.OptionalCategories.length;
  }

  createCategory(category) {
    this.categoryName = "";
    this.categoryId = 0;
    this.createCategoryPopupTitle = "Create Category";
    this.editOrCreateButton = "Create";
    this.showCategoryStatus = false;
    this.enableSaveCategory = false;
    this.categoryLengthValidation = false;
    this.modalService.open(category, { size: 'lg', scrollable: true, backdrop: 'static' });
  }

  saveCategory(formData: any) {
    let category = new Category();
    let message: any;
    category.Name = this.categoryName;
    category.Enabled = this.enable == 'statusenabled' ? true : false;
    category.Optional = this.categoryType == 'mandatory' ? false : true;
    category.CategoryId = this.categoryId;
    if (this.categoryId != 0) {
      message = 'Category has been updated.';
    }
    else {
      message = 'A new category has been created.';
    }
    if (this.nonAutoApprovedContentSources != undefined && this.autoApprovedContentSources != undefined) {
      this.feedCategories = this.nonAutoApprovedContentSources.concat(this.autoApprovedContentSources);
    }

    let contentCategory = new ContentSourceViewModel();
    let allData = [category];
    contentCategory.category = category;
    contentCategory.feed = this.feedCategories;
    this.subs.sink = this.settingsService.saveCategory(contentCategory, localStorage.getItem("Username")).subscribe(
      (success) => {
        this.setNewCategory(success, message)

        setTimeout(() => {
          this.categoryUpdated = false;
        }, 5000);
      },
      (error) => {
        this.apiService.handleApiException(error);
        this.toastService.error('Failed to save category.');
      });
  }

  setNewCategory(newCategory, message) {
    this.categoryUpdated = true;
    this.toastService.success(message);
    this.modalService.dismissAll();
    this.getCategories();
  }

  editCategory(categoryModal, category) {
    this.isShowValidation = false;
    this.showCategoryStatus = true;
    this.createCategoryPopupTitle = "Edit Category";
    this.modalService.open(categoryModal, { size: 'lg', scrollable: true, backdrop: 'static' });
    if (category.Name.length >= 2) {
      this.enableSaveCategory = true;
    }
    this.categoryName = category.Name;
    this.categoryType = category.Optional ? "optional" : "mandatory";
    this.enable = category.Enabled ? "statusenabled" : "statusdisabled";
    this.categoryId = category.CategoryId;
    this.editOrCreateButton = "Save";
  }

  enbaleOrDisableCategory(event) {
    let category = new Category();
    category.CategoryId = this.categoryId;
    category.Enabled = event.target.value == "statusenabled" ? true : false;
    if (!category.Enabled) {

      this.subs.sink = this.settingsService.getAssociatedContentSources(category.CategoryId).subscribe(
        (success) => {
          this.setContentsourceCategories(success, category);
        },
        (error) => { this.ShowError(error); }
      );
    }
    else {
      this.nonAutoApprovedContentSources = [];
      this.autoApprovedContentSources = [];
      this.enableSaveCategory = true;
      this.selectedCategoryId = null;
    }
  }

  setContentsourceCategories(response, category) {
    this.enableSaveCategory = false;
    if (response.ApprovedContentSources.length > 0 || response.NonApprovedContentSources.length > 0) {
      this.isCategoryEdit = true;
      if (response.ApprovedContentSources.length <= 0) {
        this.isAutoApprovedSource = true;
      }

      if (response.NonApprovedContentSources.length <= 0) {
        this.isNonAutoApprovedSource = true;
      }

      this.autoApprovedContentSources = response.ApprovedContentSources;
      this.nonAutoApprovedContentSources = response.NonApprovedContentSources;
      this.categoryId = category.CategoryId;
      this.subs.sink = this.settingsService.getEnableCategoryList(category.CategoryId).subscribe(
        (success) => {
          this.popupCategoryDropdown(success);
        },
        (error) => { this.ShowError(error); }
      );
    }
    else {
      this.enableSaveCategory = true;
    }
  }

  popupCategoryDropdown(data) {
    this.enableSaveCategory = false;
    let allCategories = { ...data.OptionalCategoryList, ...data.ManadatoryCategoryList };
    this.categoryList = this.helper.createDropdownObservable(allCategories, '0', 'All');
  }

  changeCategory(feedId, formData: any) {

    this.categoryCounter = 0;
    let selectedCategoryId = formData.nonApprovedCategories.categorynonAuto;
    let previousCategoryId = this.categoryId;
    this.allSources = [];
    this.nonAutoApprovedContentSources.forEach(function (data: ContentSource) {
      if (data.FeedId == feedId) {
        data.CategoryId = selectedCategoryId;
      }
    });

    this.autoApprovedContentSources.forEach(function (data: ContentSource) {
      if (data.FeedId == feedId) {
        data.CategoryId = selectedCategoryId;
      }
    });

    this.nonAutoApprovedContentSources.concat(this.autoApprovedContentSources);
    this.nonAutoApprovedContentSources.forEach(function (data: ContentSource) {
      if (data.CategoryId == 0 || data.CategoryId == 'selectedCategoryId') {
        this.categoryCounter++;
      }

    }.bind(this));
    this.autoApprovedContentSources.forEach(function (data: ContentSource) {
      if (data.CategoryId == 0 || data.CategoryId == 'selectedCategoryId') {
        this.categoryCounter++;
      }

    }.bind(this));

    if (this.categoryCounter == 0) {
      this.enableSaveCategory = true;
    }
  }

  getFeedsAssociated(category: Category, categoryfeedlist: any) {
    this.subs.sink = this.settingsService.getAssociatedContentSources(category.CategoryId).subscribe(
      (success) => {
        this.setFeedListAssociated(success, categoryfeedlist, category);
      },
      (error) => { this.ShowError(error); }
    );
  }

  setFeedListAssociated(feeds: any, categoryfeedlist: any, category: Category) {
    this.categoryName = category.Name;
    this.autoApprovedContentSources = feeds.ApprovedContentSources;
    this.nonAutoApprovedContentSources = feeds.NonApprovedContentSources;
    this.allCategoryFeeds = this.autoApprovedContentSources.concat(this.nonAutoApprovedContentSources);
    this.modalService.open(categoryfeedlist, { size: 'lg' });
  }

  getCategoryTab(data) {
    if (data != 'mandatory') {
      this.isMandatoryTab = false;
    }
    else {
      this.isMandatoryTab = true;
    }
  }

  //Enable Disable filter.
  enbaleOrDisable() {
    if (this.isMandatoryTab) {
      if (this.enbaleOrdisableFilter == false) {
        this.mandatoryCategories.sort(function (x, y) {
          return (x.Enabled === y.Enabled) ? 0 : x.Enabled ? -1 : 1;
        });
        this.enbaleOrdisableFilter = true;
      }
      else {
        this.mandatoryCategories.sort(function (x, y) {
          return (x.Enabled === y.Enabled) ? 0 : x.Enabled ? 1 : -1;
        });
        this.enbaleOrdisableFilter = false;
      }
    }
    else {
      if (this.enbaleOrdisableFilter == false) {
        this.optionalCategories.sort(function (x, y) {
          return (x.Enabled === y.Enabled) ? 0 : x.Enabled ? -1 : 1;
        });
        this.enbaleOrdisableFilter = true;
      }
      else {
        this.optionalCategories.sort(function (x, y) {
          return (x.Enabled === y.Enabled) ? 0 : x.Enabled ? 1 : -1;
        });
        this.enbaleOrdisableFilter = false;
      }
    }
  }

  validate(event) {
    let categoryNmae = event.target.value.trim();
    if (categoryNmae == "") {
      this.enableSaveCategory = false;
    }
    if (categoryNmae.length >= 2) {
      this.enableSaveCategory = true;
    }
    else {
      this.enableSaveCategory = false;
    }
    if (categoryNmae.length >= 20) {
      this.categoryLengthValidation = true;
      this.enableSaveCategory = false;
    }
    else {
      this.categoryLengthValidation = false;
    }
  }

  closeCategoryModal() {
    this.showCategoryStatus = false;
    this.isAutoApprovedSource = false;
    this.isNonAutoApprovedSource = false;
    this.nonAutoApprovedContentSources = [];
    this.autoApprovedContentSources = [];
    this.selectedCategoryId = null;
    this.isCategoryEdit = false;
    this.modalService.dismissAll();
  }
}
